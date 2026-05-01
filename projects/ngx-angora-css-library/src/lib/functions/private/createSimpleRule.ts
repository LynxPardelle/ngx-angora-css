import { css_create_diagnostics } from '../css_create_diagnostics';
/* Singletons */
import { ValuesSingleton } from '../../singletons/valuesSingleton';
/* Funtions */
import { console_log } from '../console_log';
/* Types */
import { TLogPartsOptions } from '../../types';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('createSimpleRule', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('createSimpleRule', toLog);
};

const normalizeSelector = (selector: string | undefined): string => (selector || '').trim().replace(/\s+/g, ' ');

const getRuleSelector = (rule: string): string => normalizeSelector(rule.split('{')[0]);

const getCssRuleSelector = (rule: CSSRule): string => {
  const cssStyleRule = rule as CSSStyleRule;
  if (typeof cssStyleRule.selectorText === 'string') {
    return normalizeSelector(cssStyleRule.selectorText);
  }

  return getRuleSelector(rule.cssText);
};

const isGroupingRule = (rule: CSSRule): boolean =>
  typeof (rule as CSSStyleRule).selectorText !== 'string' && !!(rule as CSSGroupingRule).cssRules;

const deleteMatchingSelector = (sheet: CSSStyleSheet, selector: string): void => {
  const normalizedSelector = normalizeSelector(selector);
  if (!normalizedSelector) return;

  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    const rule = sheet.cssRules[i];
    if (isGroupingRule(rule)) continue;

    if (getCssRuleSelector(rule) === normalizedSelector) {
      sheet.deleteRule(i);
    }
  }
};

const deleteDuplicateInsertedSelectors = (sheet: CSSStyleSheet, insertedIndex: number): void => {
  const insertedRule = sheet.cssRules[insertedIndex];
  if (!insertedRule || isGroupingRule(insertedRule)) return;

  const insertedSelector = getCssRuleSelector(insertedRule);
  if (!insertedSelector) return;

  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    if (i === insertedIndex) continue;

    const rule = sheet.cssRules[i];
    if (isGroupingRule(rule)) continue;

    if (getCssRuleSelector(rule) === insertedSelector) {
      sheet.deleteRule(i);
    }
  }
};

export const createSimpleRule = (rule: string): void => {
  log(rule, 'rule');
  if (!values.sheet || typeof rule !== 'string' || rule.trim().length === 0) return;
  let originalMediaRules: boolean = false;
  let rulesParsed: string[] = rule
    .replace(/{/g, values.separator)
    .replace(/}/g, values.separator)
    .split(values.separator)
    .filter(r => r !== '')
    .map(r => {
      return r.replace(/\n/g, '').replace(/\s{2}/g, '');
    });
  if (rulesParsed.length === 0 || !rulesParsed[0]) {
    css_create_diagnostics.addDiagnostic({
      code: 'invalid-rule-fragment',
      severity: 'warning',
      stage: 'ruleCreation',
      message: 'Skipped CSS rule insertion because the rule fragment is empty after parsing.',
      details: {
        rule,
      },
      suggestedFix: 'Inspect the generated rule string and make sure it contains a selector and declaration block.',
      recoverable: true,
    });
    return;
  }
  let mediaRule: string = rulesParsed[0].includes('media') ? rulesParsed[0] : '';
  if (mediaRule !== '') {
    if (mediaRule.endsWith(' ')) {
      mediaRule = mediaRule.slice(0, -1);
    }
    rulesParsed.shift();
    [...values.sheet.cssRules].forEach((css: CSSRule | CSSGroupingRule) => {
      const groupingRule = css as CSSGroupingRule;
      if (css.cssText.includes(mediaRule) && isGroupingRule(css)) {
        originalMediaRules = true;
        let i = 0;
        while (i <= rulesParsed.length) {
          let index: number = 0;
          let posibleRule: any = [...groupingRule.cssRules].some((cssRule: any, ix: number) => {
            if (cssRule.cssText.includes(rulesParsed[i])) {
              index = ix;
              return true;
            } else {
              return false;
            }
          })
            ? [...groupingRule.cssRules].find((cs, i) =>
                cs.cssText.split(' ').find((aC: string) => {
                  return aC.replace('.', '') === rulesParsed[i];
                })
              )
            : /* .includes(rulesParsed[i])) */
              /*
            i.cssText.split(' ').find((aC: string) => {
                return aC.replace('.', '') === bef;
              })
            */
              undefined;
          if (!!posibleRule) {
            groupingRule.deleteRule(index);
          }
          let newRule: string = `${rulesParsed[i]}{${rulesParsed[i + 1]}}`;
          log(newRule, 'newRule');
          groupingRule.insertRule(newRule, groupingRule.cssRules.length);
          i = i + 2;
        }
      }
    });
  }
  if (originalMediaRules === false) {
    log(rule, 'rule');
    deleteMatchingSelector(values.sheet, getRuleSelector(rule));
    const insertedIndex = values.sheet.insertRule(rule, values.sheet.cssRules.length);
    deleteDuplicateInsertedSelectors(values.sheet, insertedIndex);
  }
};
