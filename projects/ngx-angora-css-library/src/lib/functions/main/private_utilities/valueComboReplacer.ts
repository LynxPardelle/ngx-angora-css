import { css_create_diagnostics } from '../../../functions/css_create_diagnostics';
import { console_log } from '../../console_log';
/* Types */
import { TLogPartsOptions } from '../../../types';
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('valueComboReplacer', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('valueComboReplacer', toLog);
};
export const valueComboReplacer = (c: string, vals: string[]): string => {
  if (typeof c !== 'string' || !Array.isArray(vals)) {
    css_create_diagnostics.addDiagnostic({
      code: 'invalid-combo-replacement-input',
      severity: 'warning',
      stage: 'valueComboReplacer',
      message: 'Skipped combo replacement because the input values are not valid.',
      details: {
        c,
        vals,
      },
      suggestedFix: 'Ensure combo replacement receives a class string and an array of values.',
      recoverable: true,
    });
    return typeof c === 'string' ? c : '';
  }

  multiLog([
    [c, 'c'],
    [vals, 'vals'],
  ]);
  let reg = new RegExp(/VAL[0-9]+(DEF[^D]*(?:D(?!EF)[^D]*)*DEF)?/, 'g');
  if (reg.test(c)) {
    let matches = c.match(reg);
    log(matches, 'matches');
    if (!!matches) {
      for (let match of matches) {
        log(match, 'match');
        const matchAfterVAL = match.split('VAL')[1];
        if (!matchAfterVAL) {
          css_create_diagnostics.addDiagnostic({
            code: 'invalid-combo-replacement-token',
            severity: 'warning',
            stage: 'valueComboReplacer',
            message: 'Skipped a malformed combo replacement token because it does not contain a VAL index.',
            details: { match },
            suggestedFix: 'Check that combo replacement tokens include a numeric VAL prefix.',
            recoverable: true,
          });
          continue;
        }
        let val = parseInt(matchAfterVAL.split('DEF')[0]);
        if (Number.isNaN(val)) {
          css_create_diagnostics.addDiagnostic({
            code: 'invalid-combo-replacement-index',
            severity: 'warning',
            stage: 'valueComboReplacer',
            message: 'Skipped a malformed combo replacement token because its index is not numeric.',
            details: { match },
            suggestedFix: 'Use numeric indexes in VAL replacement tokens.',
            recoverable: true,
          });
          continue;
        }
        log(val, 'val');
        let valueToMatch = `VAL${val}(DEF[^D]*(?:D(?!EF)[^D]*)*DEF)?`;
        let valueReg = new RegExp(valueToMatch, 'g');
        log(valueToMatch, 'valueToMatch');
        let def = match.split('DEF')[1];
        multiLog([
          [def, 'def'],
          [vals, 'vals'],
          [vals[val], 'vals_val'],
        ]);
        if (
          !!vals[val] &&
          vals[val] !== '' &&
          vals[val] !== 'undefined' &&
          vals[val] !== 'DEF' &&
          vals[val] !== 'null'
        ) {
          if (/VAL[0-9]+/.test(vals[val])) {
            /* When you want to use another defined value */
            let valval = vals[val].replace(/VAL/g, '');
            log(valval, 'valval');
            c = c.replace(
              valueReg,
              vals[parseInt(valval)] && vals[parseInt(valval)] !== 'VAL' + valval
                ? vals[parseInt(valval)]
                : def
                ? def
                : ''
            );
            log(c, 'c');
          } else {
            /* When you defined a custom value */
            c = c.replace(valueReg, vals[val]);
            log(c, 'c');
          }
        } else {
          /* When you dont define a value its defined the default value */
          c = c.replace(valueReg, def ? def : '');
          log(c, 'c');
        }
      }
      return c;
    } else {
      return c;
    }
  } else {
    return c;
  }
};
