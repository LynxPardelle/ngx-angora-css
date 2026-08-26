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

const transformOutsideStrings = (text: string, transform: (part: string) => string): string =>
  text
    .split(/("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\(?:\r\n|[\s\S]))/g)
    .map((part, index) => (index % 2 === 0 ? transform(part) : part))
    .join('');

const normalizeSelector = (selector: string | undefined): string =>
  transformOutsideStrings((selector || '').trim(), part => part.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', '));

const getRuleSelector = (rule: string): string => normalizeSelector(rule.split('{')[0]);

const getCssRuleSelector = (rule: CSSRule): string => {
  const cssStyleRule = rule as CSSStyleRule;
  if (typeof cssStyleRule.selectorText === 'string') {
    return normalizeSelector(cssStyleRule.selectorText);
  }

  return getRuleSelector(rule.cssText);
};

const isGroupingRule = (rule: CSSRule | undefined): boolean =>
  !!rule && typeof (rule as CSSStyleRule).selectorText !== 'string' && !!(rule as CSSGroupingRule).cssRules;

const reportInvalidRule = (rule: string): void => {
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
};

export const createSimpleRules = (rules: string[]): void => {
  if (!values.sheet || !Array.isArray(rules) || rules.length === 0) return;

  const rulesBySelector = new Map<string, string>();
  for (const rule of rules) {
    if (typeof rule !== 'string' || rule.trim().length === 0) continue;
    log(rule, 'rule');
    const selector = getRuleSelector(rule);
    if (!selector) {
      reportInvalidRule(rule);
      continue;
    }

    rulesBySelector.delete(selector);
    rulesBySelector.set(selector, rule);
  }
  const selectorOrder = [...rulesBySelector.keys()];
  if (selectorOrder.length === 0) return;

  const targetSelectors = new Set(selectorOrder);
  const existingRules: Array<{ index: number; selector: string }> = [];
  for (let index = 0; index < values.sheet.cssRules.length; index++) {
    const cssRule = values.sheet.cssRules[index];
    const selector = getCssRuleSelector(cssRule);
    if (!isGroupingRule(cssRule) && targetSelectors.has(selector)) {
      existingRules.push({ index, selector });
    }
  }

  const insertedSelectors = new Set<string>();
  for (const selector of selectorOrder) {
    const rule = rulesBySelector.get(selector) as string;
    try {
      values.sheet.insertRule(rule, values.sheet.cssRules.length);
      insertedSelectors.add(selector);
    } catch (error: unknown) {
      css_create_diagnostics.recordRuleCreationError(rule, error);
    }
  }

  for (let index = existingRules.length - 1; index >= 0; index--) {
    const existingRule = existingRules[index];
    if (insertedSelectors.has(existingRule.selector)) {
      values.sheet.deleteRule(existingRule.index);
    }
  }
};

export const createSimpleRule = (rule: string): void => createSimpleRules([rule]);
