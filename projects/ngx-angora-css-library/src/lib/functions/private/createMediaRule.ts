import { css_create_diagnostics } from '../css_create_diagnostics';
/* Singletons */
import { ValuesSingleton } from '../../singletons/valuesSingleton';
/* Funtions */
import { console_log } from '../console_log';
/* Types */
import { TLogPartsOptions } from '../../types';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('createMediaRule', t, p);
};

type ParsedMediaRule = {
  conditionText: string;
  nestedRules: string[];
};

type PendingMediaRules = {
  rulesBySelector: Map<string, string>;
};

const transformOutsideStrings = (text: string, transform: (part: string) => string): string =>
  text
    .split(/("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\(?:\r\n|[\s\S]))/g)
    .map((part, index) => (index % 2 === 0 ? transform(part) : part))
    .join('');

const normalizeText = (text: string | undefined): string =>
  transformOutsideStrings((text || '').trim(), part => part.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', '));

const normalizeMediaCondition = (text: string | undefined): string =>
  transformOutsideStrings(normalizeText(text), part => part.replace(/\)\s*and\s*\(/gi, ') and ('));

const getRuleSelector = (rule: string): string => normalizeText(rule.split('{')[0]);

const getCssRuleSelector = (rule: CSSRule): string => {
  const cssStyleRule = rule as CSSStyleRule;
  if (typeof cssStyleRule.selectorText === 'string') {
    return normalizeText(cssStyleRule.selectorText);
  }

  return getRuleSelector(rule.cssText);
};

const parseMediaRule = (rule: string): ParsedMediaRule | null => {
  const match = rule.match(/^@media\s+([^{]+)\s*\{([\s\S]*)\}\s*$/);
  if (!match) return null;

  const conditionText = normalizeMediaCondition(match[1]);
  const nestedRules: string[] = [];
  const nestedRuleRegex = /([^{}]+)\{([^{}]*)\}/g;
  let nestedMatch: RegExpExecArray | null;

  while ((nestedMatch = nestedRuleRegex.exec(match[2])) !== null) {
    const selector = normalizeText(nestedMatch[1]);
    const declarations = nestedMatch[2].trim();
    if (selector && declarations) {
      nestedRules.push(`${selector}{${declarations}}`);
    }
  }

  return {
    conditionText,
    nestedRules,
  };
};

const reportInvalidMediaRule = (rule: string): void => {
  css_create_diagnostics.addDiagnostic({
    code: 'invalid-media-rule-fragment',
    severity: 'warning',
    stage: 'ruleCreation',
    message: 'Skipped responsive CSS rule insertion because the media rule could not be parsed.',
    details: {
      rule,
    },
    suggestedFix: 'Inspect the generated media rule and make sure it contains a condition, selector, and declaration block.',
    recoverable: true,
  });
};

export const createMediaRules = (rules: string[]): void => {
  if (!values.responsiveSheet || !Array.isArray(rules) || rules.length === 0) return;

  const pendingByCondition = new Map<string, PendingMediaRules>();
  const directRules: string[] = [];
  for (const rule of rules) {
    if (typeof rule !== 'string' || rule.trim().length === 0) continue;
    log(rule, 'rule');
    const parsedRule = parseMediaRule(rule);
    if (!parsedRule || parsedRule.nestedRules.length === 0) {
      directRules.push(rule);
      continue;
    }

    const pending = pendingByCondition.get(parsedRule.conditionText) || {
      rulesBySelector: new Map<string, string>(),
    };
    for (const nestedRule of parsedRule.nestedRules) {
      const selector = getRuleSelector(nestedRule);
      pending.rulesBySelector.delete(selector);
      pending.rulesBySelector.set(selector, nestedRule);
    }
    pendingByCondition.set(parsedRule.conditionText, pending);
  }

  for (const rule of directRules) {
    try {
      values.responsiveSheet.insertRule(rule, values.responsiveSheet.cssRules.length);
    } catch (error: unknown) {
      reportInvalidMediaRule(rule);
      css_create_diagnostics.recordRuleCreationError(rule, error);
    }
  }
  if (pendingByCondition.size === 0) return;

  const ownersByCondition = new Map<string, CSSMediaRule[]>();
  for (let index = 0; index < values.responsiveSheet.cssRules.length; index++) {
    const mediaRule = values.responsiveSheet.cssRules[index] as CSSMediaRule;
    if (typeof mediaRule.conditionText !== 'string' || !mediaRule.cssRules) continue;
    const conditionText = normalizeMediaCondition(mediaRule.conditionText);
    const owners = ownersByCondition.get(conditionText) || [];
    owners.push(mediaRule);
    ownersByCondition.set(conditionText, owners);
  }

  for (const [conditionText, pending] of pendingByCondition) {
    const selectorOrder = [...pending.rulesBySelector.keys()];
    let owners = ownersByCondition.get(conditionText) || [];
    if (owners.length === 0) {
      const mediaRuleText = `@media ${conditionText} {}`;
      let insertedIndex: number;
      try {
        insertedIndex = values.responsiveSheet.insertRule(mediaRuleText, values.responsiveSheet.cssRules.length);
      } catch (error: unknown) {
        css_create_diagnostics.recordRuleCreationError(mediaRuleText, error);
        continue;
      }
      const mediaRule = values.responsiveSheet.cssRules[insertedIndex] as CSSMediaRule;
      if (!mediaRule?.cssRules) continue;
      owners = [mediaRule];
      ownersByCondition.set(conditionText, owners);
    }

    const targetSelectors = new Set(selectorOrder);
    const existingRulesByOwner = new Map<CSSMediaRule, Array<{ index: number; selector: string }>>();
    for (const owner of owners) {
      const existingRules: Array<{ index: number; selector: string }> = [];
      for (let index = 0; index < owner.cssRules.length; index++) {
        const selector = getCssRuleSelector(owner.cssRules[index]);
        if (targetSelectors.has(selector)) {
          existingRules.push({ index, selector });
        }
      }
      existingRulesByOwner.set(owner, existingRules);
    }

    const targetOwner = owners[owners.length - 1];
    const insertedSelectors = new Set<string>();
    for (const selector of selectorOrder) {
      const rule = pending.rulesBySelector.get(selector) as string;
      try {
        targetOwner.insertRule(rule, targetOwner.cssRules.length);
        insertedSelectors.add(selector);
      } catch (error: unknown) {
        css_create_diagnostics.recordRuleCreationError(rule, error);
      }
    }

    for (const [owner, existingRules] of existingRulesByOwner) {
      for (let index = existingRules.length - 1; index >= 0; index--) {
        const existingRule = existingRules[index];
        if (insertedSelectors.has(existingRule.selector)) {
          owner.deleteRule(existingRule.index);
        }
      }
    }
  }
};

export const createMediaRule = (rule: string): void => createMediaRules([rule]);
