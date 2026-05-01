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
export const createMediaRule = (rule: string): void => {
  log(rule, 'rule');
  let index: number | undefined;
  if (!values.responsiveSheet || typeof rule !== 'string' || rule.trim().length === 0) return;
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
