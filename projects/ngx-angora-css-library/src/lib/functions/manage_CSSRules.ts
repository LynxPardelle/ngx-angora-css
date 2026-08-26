/* Singletons */
import { ValuesSingleton } from '../singletons/valuesSingleton';
/* Funtions */
import { css_create_diagnostics } from './css_create_diagnostics';
import { console_log } from './console_log';
import { createMediaRules } from './private/createMediaRule';
import { createSimpleRules } from './private/createSimpleRule';
/* Types */
import { TLogPartsOptions } from '../types';

const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('manageCSSRules', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('manageCSSRules', toLog);
};
export const manage_CSSRules = {
  createCSSRules(rules: string | string[], dontSplitted: boolean = false): void {
    multiLog([
      [rules, 'rules'],
      [dontSplitted, 'dontSplitted'],
    ]);
    try {
      const ruleList = Array.isArray(rules)
        ? rules
        : dontSplitted
          ? rules.split(values.separator)
          : [rules];
      const normalizedRules = ruleList.map(rule => rule.trim()).filter(rule => rule.length > 0);
      createSimpleRules(normalizedRules.filter(rule => !rule.startsWith('@media')));
      createMediaRules(normalizedRules.filter(rule => rule.startsWith('@media')));
    } catch (err: any) {
      css_create_diagnostics.recordRuleCreationError(Array.isArray(rules) ? rules.join(values.separator) : rules, err);
      console_log.consoleLog('error', { err: err });
    }
  },
  createCSSRule(rule: string): void {
    log(rule, 'rule');
    try {
      if (typeof rule !== 'string' || rule.trim().length === 0) {
        return;
      }
      manage_CSSRules.createCSSRules([rule]);
      log(values.sheet, 'sheet');
    } catch (err: any) {
      css_create_diagnostics.recordRuleCreationError(rule, err);
      console_log.consoleLog('error', { err: err });
    }
  },
};
