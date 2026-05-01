/// <reference types="jasmine" />
import { ValuesSingleton } from '../../singletons/valuesSingleton';
import { css_create_diagnostics } from '../css_create_diagnostics';
import { doCssCreate } from './doCssCreate';

describe('doCssCreate', () => {
  let values: ValuesSingleton;
  let insertRuleSpy: jasmine.Spy;
  let responsiveInsertRuleSpy: jasmine.Spy;
  let styleElement: HTMLStyleElement | undefined;
  let responsiveStyleElement: HTMLStyleElement | undefined;

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

  afterEach(() => {
    styleElement?.remove();
    responsiveStyleElement?.remove();
    styleElement = undefined;
    responsiveStyleElement = undefined;
  });

  const useRealManagedStyleSheets = () => {
    styleElement = document.createElement('style');
    responsiveStyleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    document.head.appendChild(responsiveStyleElement);
    values.sheet = styleElement.sheet as CSSStyleSheet;
    values.responsiveSheet = responsiveStyleElement.sheet as CSSStyleSheet;
  };

  const countRulesContaining = (sheet: CSSStyleSheet, fragment: string): number => {
    let count = 0;
    for (const rule of Array.from(sheet.cssRules)) {
      const groupingRule = rule as CSSGroupingRule;
      const isGroupingRule = typeof (rule as CSSStyleRule).selectorText !== 'string' && !!groupingRule.cssRules;
      if (isGroupingRule) {
        count += Array.from(groupingRule.cssRules).filter(nestedRule => nestedRule.cssText.includes(fragment)).length;
      } else if (rule.cssText.includes(fragment)) {
        count++;
      }
    }
    return count;
  };

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

  it('replaces an existing simple selector instead of inserting duplicate CSS rules', () => {
    useRealManagedStyleSheets();

    doCssCreate(1, ['ank-color-red']);
    doCssCreate(2, ['ank-color-red']);

    expect(countRulesContaining(values.sheet as CSSStyleSheet, '.ank-color-red')).toBe(1);
  });

  it('replaces existing responsive selectors instead of duplicating media rules', () => {
    useRealManagedStyleSheets();

    doCssCreate(1, ['ank-color-md-red']);
    doCssCreate(2, ['ank-color-md-red']);

    expect(countRulesContaining(values.responsiveSheet as CSSStyleSheet, '.ank-color-md-red')).toBe(5);
  });

  it('does not multiply selector-targeted responsive rules across repeated creation passes', () => {
    useRealManagedStyleSheets();

    doCssCreate(1, ['ank-gridTemplateColumnsSEL__COM_AButtonGallery-md-repeatSD2COM__1frED']);
    doCssCreate(2, ['ank-gridTemplateColumnsSEL__COM_AButtonGallery-md-repeatSD2COM__1frED']);

    expect(countRulesContaining(values.responsiveSheet as CSSStyleSheet, '.AButtonGallery')).toBe(5);
  });
});
