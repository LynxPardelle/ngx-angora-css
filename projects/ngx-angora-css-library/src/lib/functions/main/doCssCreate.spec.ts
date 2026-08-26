/// <reference types="jasmine" />
import { ValuesSingleton } from '../../singletons/valuesSingleton';
import { css_create_diagnostics } from '../css_create_diagnostics';
import { manage_CSSRules } from '../manage_CSSRules';
import { doCssCreate } from './doCssCreate';

type CountingStyleSheet = {
  sheet: CSSStyleSheet;
  ruleReads: () => number;
};

const selectorFromRule = (rule: string): string => rule.slice(0, rule.indexOf('{')).trim();

const createCountingStyleSheet = (seedCount: number): CountingStyleSheet => {
  const rules: Array<Partial<CSSStyleRule>> = Array.from({ length: seedCount }, (_, index) => ({
    cssText: `.seed-${index}{color:red;}`,
    selectorText: `.seed-${index}`,
    style: { cssText: 'color: red;' } as CSSStyleDeclaration,
  }));
  let reads = 0;
  const cssRules = new Proxy(rules, {
    get(target, property, receiver) {
      if (typeof property === 'string' && /^\d+$/.test(property)) {
        reads++;
      }
      if (property === Symbol.iterator) {
        return function* () {
          for (let index = 0; index < target.length; index++) {
            reads++;
            yield target[index];
          }
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });
  const sheet = {
    cssRules: cssRules as unknown as CSSRuleList,
    insertRule: (rule: string, index: number) => {
      rules.splice(index, 0, {
        cssText: rule,
        selectorText: selectorFromRule(rule),
        style: { cssText: rule.slice(rule.indexOf('{') + 1, rule.lastIndexOf('}')) } as CSSStyleDeclaration,
      });
      return index;
    },
    deleteRule: (index: number) => {
      rules.splice(index, 1);
    },
  } as unknown as CSSStyleSheet;

  return { sheet, ruleReads: () => reads };
};

const createCountingResponsiveStyleSheet = (seedCount: number): CountingStyleSheet => {
  const nestedRules: Array<Partial<CSSStyleRule>> = Array.from({ length: seedCount }, (_, index) => ({
    cssText: `.responsive-seed-${index}{color:red;}`,
    selectorText: `.responsive-seed-${index}`,
    style: { cssText: 'color: red;' } as CSSStyleDeclaration,
  }));
  let reads = 0;
  const cssRules = new Proxy(nestedRules, {
    get(target, property, receiver) {
      if (typeof property === 'string' && /^\d+$/.test(property)) {
        reads++;
      }
      if (property === Symbol.iterator) {
        return function* () {
          for (let index = 0; index < target.length; index++) {
            reads++;
            yield target[index];
          }
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });
  const mediaRule = {
    conditionText: 'only screen and (min-width: 768px)',
    cssText: '@media only screen and (min-width: 768px) {}',
    cssRules: cssRules as unknown as CSSRuleList,
    insertRule: (rule: string, index: number) => {
      nestedRules.splice(index, 0, {
        cssText: rule,
        selectorText: selectorFromRule(rule),
        style: { cssText: rule.slice(rule.indexOf('{') + 1, rule.lastIndexOf('}')) } as CSSStyleDeclaration,
      });
      return index;
    },
    deleteRule: (index: number) => {
      nestedRules.splice(index, 1);
    },
  } as unknown as CSSMediaRule;
  const sheet = {
    cssRules: [mediaRule] as unknown as CSSRuleList,
    insertRule: () => 0,
    deleteRule: () => undefined,
  } as unknown as CSSStyleSheet;

  return { sheet, ruleReads: () => reads };
};

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
    const initialRule = Array.from((values.sheet as CSSStyleSheet).cssRules)
      .find(rule => rule.cssText.includes('.ank-color-red')) as CSSStyleRule;
    initialRule.style.color = 'blue';
    (values.sheet as CSSStyleSheet).insertRule('.sentinel{color:black;}', (values.sheet as CSSStyleSheet).cssRules.length);
    doCssCreate(2, ['ank-color-red']);

    const sheet = values.sheet as CSSStyleSheet;
    const updatedRule = Array.from(sheet.cssRules).find(rule => rule.cssText.includes('.ank-color-red')) as CSSStyleRule;
    expect(countRulesContaining(sheet, '.ank-color-red')).toBe(1);
    expect(updatedRule.style.color).not.toBe('blue');
    expect((sheet.cssRules[sheet.cssRules.length - 1] as CSSStyleRule).selectorText).toBe('.ank-color-red');
  });

  it('isolates an invalid rule without dropping valid rules from the same batch', () => {
    useRealManagedStyleSheets();
    const sheet = values.sheet as CSSStyleSheet;
    sheet.insertRule('.replace-me{color:blue;}', sheet.cssRules.length);
    sheet.insertRule('.broken{color:green;}', sheet.cssRules.length);
    const insertRule = sheet.insertRule.bind(sheet);
    spyOn(sheet, 'insertRule').and.callFake((rule: string, index?: number) => {
      if (rule.startsWith('.broken')) {
        throw new DOMException('Invalid CSS rule.', 'SyntaxError');
      }
      return insertRule(rule, index);
    });

    manage_CSSRules.createCSSRules([
      '.replace-me{color:red;}',
      '.broken{color:red;}',
      '.valid-after{display:block;}',
    ]);

    const replacement = Array.from(sheet.cssRules)
      .find(rule => (rule as CSSStyleRule).selectorText === '.replace-me') as CSSStyleRule;
    expect(replacement.style.color).toBe('red');
    const preservedRule = Array.from(sheet.cssRules)
      .find(rule => (rule as CSSStyleRule).selectorText === '.broken') as CSSStyleRule;
    expect(preservedRule.style.color).toBe('green');
    expect(countRulesContaining(sheet, '.valid-after')).toBe(1);
    expect(css_create_diagnostics.getLastReport().diagnostics.some(diagnostic => diagnostic.code === 'rule-creation-error')).toBeTrue();
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

  it('finds existing selectors across separate media blocks with the same condition', () => {
    useRealManagedStyleSheets();
    const responsiveSheet = values.responsiveSheet as CSSStyleSheet;
    responsiveSheet.insertRule(
      '@media only screen and (min-width: 768px) {.ank-color-md-red{color:blue;}}',
      responsiveSheet.cssRules.length
    );
    responsiveSheet.insertRule(
      '@media only screen and (min-width: 768px) {.unrelated{color:black;}}',
      responsiveSheet.cssRules.length
    );

    doCssCreate(1, ['ank-color-md-red']);

    expect(countRulesContaining(responsiveSheet, '.ank-color-md-red')).toBe(5);
    const matchingColors = Array.from(responsiveSheet.cssRules).flatMap(rule =>
      Array.from((rule as CSSMediaRule).cssRules)
        .filter(nestedRule => nestedRule.cssText.includes('.ank-color-md-red'))
        .map(nestedRule => (nestedRule as CSSStyleRule).style.color)
    );
    expect(matchingColors).not.toContain('blue');
  });

  it('updates duplicate nested selectors without relying on stale rule indexes', () => {
    useRealManagedStyleSheets();
    const responsiveSheet = values.responsiveSheet as CSSStyleSheet;
    responsiveSheet.insertRule(
      '@media only screen and (min-width: 768px) {' +
        '.ank-color-md-red{color:blue;}' +
        '.ank-color-md-red{color:blue;}' +
        'html .ank-color-md-red{color:blue;}' +
        'html .ank-color-md-red{color:blue;}' +
        '.sentinel{display:block;}' +
      '}'
    );

    doCssCreate(1, ['ank-color-md-red']);

    const report = css_create_diagnostics.getLastReport();
    expect(report.diagnostics.some(diagnostic => diagnostic.code === 'rule-creation-error')).toBeFalse();
    expect(countRulesContaining(responsiveSheet, '.ank-color-md-red')).toBe(5);
    expect(countRulesContaining(responsiveSheet, '.sentinel')).toBe(1);
  });

  it('indexes a populated stylesheet once instead of rescanning it for every new selector', () => {
    const seededRuleCount = 100;
    const classes = Array.from({ length: 10 }, (_, index) => `ank-zIndex-${index + 1}`);
    const countingSheet = createCountingStyleSheet(seededRuleCount);
    values.sheet = countingSheet.sheet;

    doCssCreate(1, classes);

    expect(countingSheet.ruleReads()).toBeLessThanOrEqual(seededRuleCount + classes.length * 4);
  });

  it('indexes existing classes once during a full DOM discovery run', () => {
    const seededRuleCount = 100;
    const classes = Array.from({ length: 10 }, (_, index) => `ank-zIndex-${index + 1}`);
    const countingSheet = createCountingStyleSheet(seededRuleCount);
    const host = document.createElement('div');
    host.innerHTML = classes.map(className => `<span class="${className}"></span>`).join('');
    document.body.appendChild(host);
    values.sheet = countingSheet.sheet;

    try {
      doCssCreate(1);
    } finally {
      host.remove();
    }

    expect(css_create_diagnostics.getLastReport().createdClasses).toBe(classes.length);
    expect(countingSheet.ruleReads()).toBeLessThanOrEqual(seededRuleCount * 2 + classes.length * 4);
  });

  it('does not treat a secondary class in a compound selector as its own generated utility', () => {
    useRealManagedStyleSheets();
    const sheet = values.sheet as CSSStyleSheet;
    sheet.insertRule('.wrapper .ank-color-red{color:blue;}', sheet.cssRules.length);
    const host = document.createElement('span');
    host.className = 'ank-color-red';
    document.body.appendChild(host);

    try {
      doCssCreate(1);
    } finally {
      host.remove();
    }

    const standaloneRule = Array.from(sheet.cssRules).find(
      rule => (rule as CSSStyleRule).selectorText === '.ank-color-red'
    ) as CSSStyleRule | undefined;
    expect(css_create_diagnostics.getLastReport().createdClasses).toBe(1);
    expect(standaloneRule?.style.color).toBe('rgb(255, 0, 0)');
  });

  it('reuses canonicalized bounded media conditions across repeated creation passes', () => {
    useRealManagedStyleSheets();
    values.limitBPS = true;

    try {
      doCssCreate(1, ['ank-color-md-red']);
      doCssCreate(2, ['ank-color-md-red']);

      const matchingMediaRules = Array.from((values.responsiveSheet as CSSStyleSheet).cssRules)
        .filter(rule => {
          const condition = (rule as CSSMediaRule).conditionText || '';
          return condition.includes('min-width: 768px') && condition.includes('max-width: 992px');
        }) as CSSMediaRule[];
      expect(matchingMediaRules.length).toBe(1);
      expect(matchingMediaRules[0].cssRules.length).toBe(5);
    } finally {
      values.limitBPS = false;
    }
  });

  it('preserves valid public media rules whose declarations contain quoted braces', () => {
    useRealManagedStyleSheets();

    manage_CSSRules.createCSSRules(['@media screen {.quoted-braces{content:"{}";}}']);

    const mediaRule = Array.from((values.responsiveSheet as CSSStyleSheet).cssRules)
      .find(rule => (rule as CSSMediaRule).conditionText === 'screen') as CSSMediaRule | undefined;
    const nestedRule = mediaRule ? Array.from(mediaRule.cssRules)
      .find(rule => (rule as CSSStyleRule).selectorText === '.quoted-braces') as CSSStyleRule | undefined : undefined;
    expect(nestedRule?.style.content).toBe('"{}"');
  });

  it('preserves literal and text inside media-rule selectors', () => {
    useRealManagedStyleSheets();

    manage_CSSRules.createCSSRules([
      '@media screen {.quoted[data-token=")and("]{color:red;}}',
      '@media screen {.quoted-comma[data-token="a,b"]{color:blue;}}',
      '@media screen {.escaped\\,comma{color:green;}}',
    ]);

    const mediaRule = Array.from((values.responsiveSheet as CSSStyleSheet).cssRules)
      .find(rule => (rule as CSSMediaRule).conditionText === 'screen') as CSSMediaRule | undefined;
    const nestedRule = mediaRule ? Array.from(mediaRule.cssRules)
      .find(rule => (rule as CSSStyleRule).selectorText?.startsWith('.quoted')) as CSSStyleRule | undefined : undefined;
    const commaRule = mediaRule ? Array.from(mediaRule.cssRules)
      .find(rule => (rule as CSSStyleRule).selectorText?.startsWith('.quoted-comma')) as CSSStyleRule | undefined : undefined;
    const escapedRule = mediaRule ? Array.from(mediaRule.cssRules)
      .find(rule => (rule as CSSStyleRule).selectorText?.startsWith('.escaped')) as CSSStyleRule | undefined : undefined;
    expect(nestedRule?.selectorText).toBe('.quoted[data-token=")and("]');
    expect(commaRule?.selectorText).toBe('.quoted-comma[data-token="a,b"]');
    expect(escapedRule?.selectorText).toBe('.escaped\\,comma');
  });

  it('keeps distinct simple selectors whose attribute literals differ only by comma spacing', () => {
    useRealManagedStyleSheets();

    manage_CSSRules.createCSSRules([
      '[data-token="a,b"]{color:red;}',
      '[data-token="a, b"]{color:blue;}',
      '.escaped\\,comma{color:green;}',
      '.escaped\\, comma{color:purple;}',
    ]);

    const selectors = Array.from((values.sheet as CSSStyleSheet).cssRules)
      .map(rule => (rule as CSSStyleRule).selectorText)
      .filter(Boolean);
    expect(selectors).toContain('[data-token="a,b"]');
    expect(selectors).toContain('[data-token="a, b"]');
    expect(selectors).toContain('.escaped\\,comma');
    expect(selectors).toContain('.escaped\\, comma');
  });

  it('indexes responsive selectors once instead of rescanning a media rule for every update', () => {
    const seededRuleCount = 100;
    const classes = Array.from({ length: 10 }, (_, index) => `ank-zIndex-md-${index + 1}`);
    const countingSheet = createCountingResponsiveStyleSheet(seededRuleCount);
    values.responsiveSheet = countingSheet.sheet;

    doCssCreate(1, classes);

    expect(countingSheet.ruleReads()).toBeLessThanOrEqual(seededRuleCount + classes.length * 5 * 4);
  });
});
