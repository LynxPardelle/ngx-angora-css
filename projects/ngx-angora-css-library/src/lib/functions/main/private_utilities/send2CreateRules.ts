import { ValuesSingleton } from '../../../singletons/valuesSingleton';
/* Interfaces */
import { IBPS } from '../../../interfaces';
/* Functions */
import { console_log } from '../../console_log';
import { manage_CSSRules } from '../../manage_CSSRules';
/* Types */
import { TLogPartsOptions } from '../../../types';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('send2CreateRules', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('send2CreateRules', toLog);
};

export const send2CreateRules = (classes2CreateStringed: string, bpsStringed: IBPS[]): void => {
  multiLog([
    [classes2CreateStringed, 'classes2CreateStringed'],
    [bpsStringed, 'bpsStringed'],
  ]);
  bpsStringed = bpsStringed
    .sort((b1, b2) => {
      return parseInt(b1.value.replace('px', '')) - parseInt(b2.value.replace('px', ''));
    })
    .reverse();
  let responsiveClasses2CreateStringed: string = '';
  for (const [i, b] of bpsStringed.entries()) {
    if (b.class2Create !== '') {
      multiLog([
        [b.bp, 'bp'],
        [b.value, 'value'],
        [b.class2Create, 'class2Create'],
      ]);

      // Keep numeric mobile-first owners separate from legacy named breakpoints,
      // including when both aliases resolve to the same width.
      const numeric = !values.limitBPS && /^px[1-9]\d{0,3}$/.test(b.bp)
        && Number(b.bp.slice(2)) <= 8192 && b.value === `${b.bp.slice(2)}px`;
      for (const specifyOption of values.bpsSpecifyOptions) {
        responsiveClasses2CreateStringed += `@media ${numeric ? '' : 'only '}screen and (min-width: ${b.value})${
          values.limitBPS
            ? bpsStringed.length > 1 && i !== 0
              ? ` and (max-width: ${bpsStringed[i - 1].value})`
              : ''
            : ''
        } { ${specifyOption} ${b.class2Create}}${values.separator}`;
      }
      b.class2Create = '';
    }
  }
  if (classes2CreateStringed !== '') {
    log(classes2CreateStringed, 'classes2CreateStringed');
    manage_CSSRules.createCSSRules(
      classes2CreateStringed.split(values.separator).filter(class2Create => class2Create !== '')
    );
  }
  if (responsiveClasses2CreateStringed !== '') {
    log(responsiveClasses2CreateStringed, 'responsiveClasses2CreateStringed');
    manage_CSSRules.createCSSRules(
      responsiveClasses2CreateStringed.split(values.separator).filter(class2Create => class2Create !== '')
    );
  }
};
