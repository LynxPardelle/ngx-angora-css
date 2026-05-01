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
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('createMediaRule', toLog);
};

type ParsedMediaRule = {
  conditionText: string;
  nestedRules: string[];
};

const normalizeText = (text: string | undefined): string => (text || '').trim().replace(/\s+/g, ' ');

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

  const conditionText = normalizeText(match[1]);
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

const findMediaRule = (conditionText: string): CSSMediaRule | undefined => {
  for (const rule of Array.from(values.responsiveSheet?.cssRules || [])) {
    const mediaRule = rule as CSSMediaRule;
    if (typeof mediaRule.conditionText === 'string' && mediaRule.cssRules && normalizeText(mediaRule.conditionText) === conditionText) {
      return mediaRule;
    }
  }

  return undefined;
};

const deleteNestedSelector = (mediaRule: CSSMediaRule, selector: string): void => {
  const normalizedSelector = normalizeText(selector);
  for (let i = mediaRule.cssRules.length - 1; i >= 0; i--) {
    if (getCssRuleSelector(mediaRule.cssRules[i]) === normalizedSelector) {
      mediaRule.deleteRule(i);
    }
  }
};

const deleteDuplicateInsertedNestedSelectors = (mediaRule: CSSMediaRule, insertedIndex: number): void => {
  const insertedRule = mediaRule.cssRules[insertedIndex];
  if (!insertedRule) return;

  const insertedSelector = getCssRuleSelector(insertedRule);
  if (!insertedSelector) return;

  for (let i = mediaRule.cssRules.length - 1; i >= 0; i--) {
    if (i === insertedIndex) continue;

    if (getCssRuleSelector(mediaRule.cssRules[i]) === insertedSelector) {
      mediaRule.deleteRule(i);
    }
  }
};

export const createMediaRule = (rule: string): void => {
  log(rule, 'rule');
  let index: number | undefined;
  if (!values.responsiveSheet || typeof rule !== 'string' || rule.trim().length === 0) return;
  const parsedMediaRule = parseMediaRule(rule);
  if (parsedMediaRule && parsedMediaRule.nestedRules.length > 0) {
    let mediaRule = findMediaRule(parsedMediaRule.conditionText);
    if (!mediaRule) {
      values.responsiveSheet.insertRule(`@media ${parsedMediaRule.conditionText} {}`, values.responsiveSheet.cssRules.length);
      mediaRule = findMediaRule(parsedMediaRule.conditionText);
    }

    if (mediaRule) {
      for (const nestedRule of parsedMediaRule.nestedRules) {
        deleteNestedSelector(mediaRule, getRuleSelector(nestedRule));
        const insertedIndex = mediaRule.insertRule(nestedRule, mediaRule.cssRules.length);
        deleteDuplicateInsertedNestedSelectors(mediaRule, insertedIndex);
      }
      return;
    }
  }

  const selectorFragment = rule.split('{')[0]?.replace('\n', '').replace(/\s+/g, ' ') || '';
  if (!selectorFragment) {
    css_create_diagnostics.addDiagnostic({
      code: 'invalid-media-rule-fragment',
      severity: 'warning',
      stage: 'ruleCreation',
      message: 'Skipped responsive CSS rule insertion because the selector fragment is empty.',
      details: {
        rule,
      },
      suggestedFix: 'Inspect the generated media rule and make sure it contains a selector before the declaration block.',
      recoverable: true,
    });
    return;
  }
  let originalRule: any = [...values.responsiveSheet.cssRules].some((cssRule: any, i: number) => {
    if (cssRule.cssText.includes(selectorFragment)) {
      index = i;
      return true;
    } else {
      return false;
    }
  })
    ? [...values.responsiveSheet.cssRules].find(
        i =>
          i.cssText
            /* .includes(
                    selectorFragment
                  ) */
            .split(' ')
            .find((aC: string) => {
              return aC.replace('.', '') === selectorFragment;
            })
        /*
            i.cssText.split(' ').find((aC: string) => {
                return aC.replace('.', '') === bef;
              })
            */
      )
    : undefined;
  if (originalRule && index !== undefined) {
    values.responsiveSheet.deleteRule(index);
  }
  log(rule, 'rule');
  values.responsiveSheet.insertRule(rule, values.responsiveSheet.cssRules.length);
};
