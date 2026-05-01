/// <reference types="jasmine" />
import { ValuesSingleton } from '../../singletons/valuesSingleton';
import { css_create_diagnostics } from '../css_create_diagnostics';
import { doCssCreate } from './doCssCreate';

describe('doCssCreate', () => {
  let values: ValuesSingleton;
  let insertRuleSpy: jasmine.Spy;
  let responsiveInsertRuleSpy: jasmine.Spy;

  beforeEach(() => {
    values = ValuesSingleton.getInstance();
    insertRuleSpy = jasmine.createSpy('insertRule');
    values.sheet = {
      cssRules: [],
      insertRule: insertRuleSpy,
    } as unknown as CSSStyleSheet;
    responsiveInsertRuleSpy = jasmine.createSpy('responsiveInsertRule');
    values.responsiveSheet = {
      cssRules: [],
      insertRule: responsiveInsertRuleSpy,
    } as unknown as CSSStyleSheet;
    values.cacheActive = false;
    values.importantActive = false;
    values.pseudos = [];
    values.alreadyCreatedClasses.clear();
    css_create_diagnostics.clear();
  });

  it('continues processing valid classes after a malformed class is skipped', () => {
    doCssCreate(1, ['ank', 'ank-color-red']);

    const report = css_create_diagnostics.getLastReport();

    expect(insertRuleSpy).toHaveBeenCalled();
    expect(report.processedClasses).toBe(2);
    expect(report.createdClasses).toBe(1);
    expect(report.skippedClasses).toBe(1);
    expect(report.failedClasses).toBe(0);
    expect(report.diagnostics.some(diagnostic => diagnostic.code === 'invalid-class-structure')).toBeTrue();
    expect(report.completedAt).toBeDefined();
  });

  it('creates responsive rules in the responsive stylesheet for breakpoint classes', () => {
    doCssCreate(1, ['ank-color-md-red']);

    expect(responsiveInsertRuleSpy).toHaveBeenCalled();
    expect(
      responsiveInsertRuleSpy.calls.allArgs().some(args => String(args[0]).includes('@media only screen and (min-width: 768px)'))
    ).toBeTrue();
  });
});