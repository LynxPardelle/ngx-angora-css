/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';

import { NgxAngoraService } from './ngx-angora.service';
import { css_create_diagnostics } from './functions/css_create_diagnostics';

const createMockStyleSheet = (spyName: string): CSSStyleSheet => {
  const cssRules: Array<Partial<CSSRule>> = [];
  const insertRule = jasmine.createSpy(spyName).and.callFake((rule: string) => {
    cssRules.push({
      cssText: rule,
    });
    return cssRules.length - 1;
  });
  const deleteRule = jasmine.createSpy(`${spyName}Delete`).and.callFake((index: number) => {
    cssRules.splice(index, 1);
  });

  return {
    cssRules: cssRules as unknown as CSSRuleList,
    insertRule,
    deleteRule,
  } as unknown as CSSStyleSheet;
};

describe('NgxAngoraService', () => {
  let service: NgxAngoraService;
  let hostElement: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxAngoraService);
    service.values.sheet = createMockStyleSheet('libraryInsertRule');
    service.values.responsiveSheet = createMockStyleSheet('libraryResponsiveInsertRule');
    service.values.cacheActive = false;
    service.values.useTimer = false;
    service.values.useRecurrentStrategy = false;
    service.values.importantActive = false;
    service.values.isDebug = false;
    service.values.colorsRegex = undefined;
    service.values.pseudos = [];
    service.values.combos = {};
    service.values.combosKeys = new Set();
    service.values.combosCreated = {};
    service.values.combosCreatedKeys = new Set();
    service.values.alreadyCreatedClasses.clear();
    hostElement = document.createElement('div');
    document.body.appendChild(hostElement);
    css_create_diagnostics.clear();
  });

  afterEach(() => {
    hostElement.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose the last css create report helpers', () => {
    css_create_diagnostics.clear();

    const report = service.getLastCssCreateReport();

    expect(report).toBeTruthy();
    expect(report.processedClasses).toBe(0);
    expect(service.clearCssCreateReport().diagnostics.length).toBe(0);
  });

  it('validates classes without mutating the last css create report', () => {
    css_create_diagnostics.clear();

    const validation = service.validateClass('ank-');
    const report = service.getLastCssCreateReport();

    expect(validation.status).toBe('invalid');
    expect(validation.diagnostics.some(diagnostic => diagnostic.code === 'invalid-class-structure')).toBeTrue();
    expect(report.diagnostics.length).toBe(0);
  });

  it('returns validation rule previews without internal separators', () => {
    const validation = service.validateClass('ank-color-red');

    expect(validation.generatedRule).toContain('.ank-color-red{color:rgba(255,0,0, 1);}');
    expect(validation.generatedRule).not.toContain(service.values.separator);
  });

  it('can mark duplicates during validation when requested', () => {
    service.values.alreadyCreatedClasses.add('ank-color-red');

    const validation = service.validateClass('ank-color-red', { checkDuplicates: true });

    expect(validation.status).toBe('duplicate');
    expect(validation.valid).toBeTrue();
    expect(validation.canCreate).toBeFalse();
  });

  it('creates CSS rules for valid classes and reports malformed discovered classes', () => {
    hostElement.innerHTML = '<div class="ank-color-red ank-"></div>';

    service.cssCreate();

    const report = service.getLastCssCreateReport();

    expect((service.values.sheet as unknown as { insertRule: jasmine.Spy }).insertRule).toHaveBeenCalled();
    expect(report.createdClasses).toBeGreaterThan(0);
    expect(report.failedClasses).toBe(0);
    expect(report.diagnostics.some(diagnostic => diagnostic.code === 'invalid-class-discovered')).toBeTrue();
  });

  it('respects explicit false values for runtime boolean options', () => {
    service.values.importantActive = true;
    service.changeImportantActive(false);

    service.values.isDebug = true;
    service.changeDebugOption(false);

    service.values.useTimer = true;
    service.changeUseTimerOption(false);

    expect(service.values.importantActive).toBeFalse();
    expect(service.values.isDebug).toBeFalse();
    expect(service.values.useTimer).toBeFalse();
  });

  it('toggles runtime boolean options when no explicit value is provided', () => {
    service.values.importantActive = false;
    service.values.isDebug = false;
    service.values.useTimer = false;

    service.changeImportantActive();
    expect(service.values.importantActive).toBeTrue();

    service.changeImportantActive();
    expect(service.values.importantActive).toBeFalse();

    service.changeDebugOption();
    expect(service.values.isDebug).toBeTrue();

    service.changeDebugOption();
    expect(service.values.isDebug).toBeFalse();

    service.changeUseTimerOption();
    expect(service.values.useTimer).toBeTrue();

    service.changeUseTimerOption();
    expect(service.values.useTimer).toBeFalse();
  });
});
