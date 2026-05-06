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
    service.values.cssCreateBatchDepth = 0;
    service.values.cssCreatePending = false;
    service.values.cssCreatePendingFullScan = false;
    service.values.cssCreatePendingClasses.clear();
    service.clearCssCreateHistory();
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

  it('defers automatic cssCreate calls while runtime configuration changes are batched', () => {
    hostElement.innerHTML = '<div class="ank-color-red"></div>';
    const insertRuleSpy = service.values.sheet as unknown as { insertRule: jasmine.Spy };

    service.beginCssCreateBatch();
    service.pushBPS([{ bp: 'wide', value: '1200px' }]);
    service.pushAbreviationsValues({ demoSpace: '1rem' });
    service.pushCombos({ DemoBox: ['ank-color-red'] });

    expect(insertRuleSpy.insertRule).not.toHaveBeenCalled();

    service.endCssCreateBatch();

    expect(insertRuleSpy.insertRule).toHaveBeenCalledTimes(1);
    expect(service.values.cssCreateBatchDepth).toBe(0);
    expect(service.values.cssCreatePending).toBeFalse();
  });

  it('closes a cssCreate batch without swallowing callback errors', () => {
    expect(() => {
      service.runInCssCreateBatch(() => {
        throw new Error('registration failed');
      });
    }).toThrowError('registration failed');

    expect(service.values.cssCreateBatchDepth).toBe(0);
  });

  it('keeps a cssCreate history with timing details for debugging', () => {
    service.cssCreate(['ank-color-red']);
    service.cssCreate(['ank-bg-blue']);

    const history = service.getCssCreateHistory();
    const summary = service.getCssCreateDebugSummary();

    expect(history.length).toBe(2);
    expect(history[0].id).toBeGreaterThan(0);
    expect(history[0].durationMs).toBeGreaterThanOrEqual(0);
    expect(history[0].completedAt).toBeGreaterThanOrEqual(history[0].startedAt);
    expect(summary.totalRuns).toBe(2);
    expect(summary.totalCreatedClasses).toBe(2);
    expect(summary.averageDurationMs).toBeGreaterThanOrEqual(0);
    expect(summary.slowestDurationMs).toBeGreaterThanOrEqual(summary.fastestDurationMs);
  });

  it('exposes a cssCreate debug snapshot and can clear the run history', () => {
    service.cssCreate(['ank-color-red']);

    const snapshot = service.getCssCreateDebugSnapshot();

    expect(snapshot.history.length).toBe(1);
    expect(snapshot.summary.totalRuns).toBe(1);
    expect(snapshot.stylesheets.normal.available).toBeTrue();
    expect(snapshot.stylesheets.normal.ruleCount).toBeGreaterThan(0);
    expect(snapshot.runtime.alreadyCreatedClasses).toBeGreaterThan(0);

    service.clearCssCreateHistory();

    expect(service.getCssCreateHistory().length).toBe(0);
    expect(service.getCssCreateDebugSummary().totalRuns).toBe(0);
  });

  it('classifies managed classes without treating unrelated combo prefixes as combos', () => {
    service.pushCombos({ btn: ['ank-display-flex ank-alignItems-center'] });

    expect(service.isComboClass('btn')).toBeTrue();
    expect(service.isComboClass('btnVALSVL1remVL')).toBeTrue();
    expect(service.isComboClass('btnBase')).toBeFalse();

    expect(service.classifyClass('btn')).toEqual(jasmine.objectContaining({
      kind: 'combo',
      managed: true,
      comboKey: 'btn',
    }));
    expect(service.classifyClass('btnBase')).toEqual(jasmine.objectContaining({
      kind: 'unknown',
      managed: false,
    }));
    expect(service.classifyClass('ank-color-red')).toEqual(jasmine.objectContaining({
      kind: 'utility',
      managed: true,
      prefix: 'ank',
    }));
  });

  it('expands explicit combo classes passed to cssCreate', () => {
    service.pushCombos({ badge: ['ank-color-red ank-bg-blue'] });
    service.clearCssCreateHistory();

    service.cssCreate(['badge']);

    const summary = service.getCssCreateDebugSummary();
    expect(summary.totalRuns).toBe(1);
    expect(summary.totalCreatedClasses).toBe(2);
    expect(service.values.combosCreatedKeys.size).toBe(1);
  });

  it('does not discover unrelated classes that only share a combo prefix', () => {
    service.pushCombos({ btn: ['ank-color-red'] });
    service.clearCssCreateHistory();
    hostElement.innerHTML = '<div class="btnBase"></div>';

    service.cssCreate();

    const summary = service.getCssCreateDebugSummary();
    expect(summary.totalCreatedClasses).toBe(0);
    expect(service.values.combosCreatedKeys.size).toBe(0);
  });

  it('audits managed stylesheets for duplicate exact rules', () => {
    const sheet = service.values.sheet as unknown as { insertRule: (rule: string) => number };
    sheet.insertRule('.ank-color-red{color:red;}');
    sheet.insertRule('.ank-color-red{color:red;}');
    sheet.insertRule('.ank-bg-blue{background:blue;}');

    const audit = service.auditManagedStylesheets();

    expect(audit.normal.available).toBeTrue();
    expect(audit.normal.ruleCount).toBe(3);
    expect(audit.normal.duplicateExactGroups).toBe(1);
    expect(audit.normal.duplicateExactRules).toEqual([
      { rule: '.ank-color-red{color:red;}', count: 2 },
    ]);
    expect(audit.totalRules).toBe(3);
    expect(audit.totalDuplicateExactGroups).toBe(1);
  });

  it('collects rendered DOM classes from a supplied root', () => {
    const root = document.createElement('section');
    root.className = 'ank-display-grid shell';
    const child = document.createElement('div');
    child.className = 'ank-display-flex btnBase';
    root.appendChild(child);

    expect(service.collectRenderedDomClasses(root)).toEqual([
      'ank-display-grid',
      'shell',
      'ank-display-flex',
      'btnBase',
    ]);
  });

  it('reports generated CSS readiness from managed stylesheets', () => {
    const sheet = service.values.sheet as unknown as { insertRule: (rule: string) => number };
    sheet.insertRule('.ank-color-red{color:red;}');

    expect(service.hasGeneratedCssRules()).toBeTrue();
  });

  it('waits for generated CSS readiness and a paint frame', async () => {
    spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback): number => {
      window.setTimeout(() => callback(performance.now()), 0);
      return 1;
    });

    const wait = service.waitForCssReady(100);
    window.setTimeout(() => {
      const sheet = service.values.sheet as unknown as { insertRule: (rule: string) => number };
      sheet.insertRule('.ank-color-red{color:red;}');
    }, 0);

    await expectAsync(wait).toBeResolvedTo(true);
  });
});
