/* Singletons */
import { ValuesSingleton } from '../singletons/valuesSingleton';
/* Funtions */
import { console_log } from './console_log';
import { cssCreate } from './cssCreate';
/* Types */
import { TLogPartsOptions } from '../types';
import { manage_cache } from './manage_cache';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('manageCombos', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('manageCombos', toLog);
};

const classBelongsToCombo = (createdClass: string, comboName: string): boolean => {
  if (typeof createdClass !== 'string' || typeof comboName !== 'string') {
    return false;
  }

  if (createdClass.includes(comboName)) {
    return true;
  }

  for (const comboKey of values.combosCreatedKeys) {
    if (!createdClass.includes(comboKey)) {
      continue;
    }

    const originalComboClass = values.combosCreated[comboKey];
    if (typeof originalComboClass === 'string' && originalComboClass.startsWith(comboName)) {
      return true;
    }
  }

  return false;
};

export const manage_combos = {
  pushCombos(combos: any): void {
    try {
      const prevIgnoredCombosValuesSet: Set<string> = new Set();
      Object.keys(combos).forEach(key => {
        values.combos[key] =
          typeof combos[key] === 'string'
            ? combos[key].split(' ')
            : combos[key]
                .map((c: string) => {
                  return c.split(' ').flat();
                })
                .flat();
        if (!values.combosKeys.has(key)) {
          values.combosKeys.add(key);
        }
        Array.from(values.alreadyCreatedClasses)
          .filter((createdClass: string) => classBelongsToCombo(createdClass, key))
          .forEach((createdClass: string) => prevIgnoredCombosValuesSet.add(createdClass));
      });
      const prevIgnoredCombosValues = Array.from(prevIgnoredCombosValuesSet);
      if (values.cacheActive) {
        manage_cache.clearAllNoneEssential();
      }
      if (prevIgnoredCombosValues.length > 0) {
        cssCreate.cssCreate(prevIgnoredCombosValues);
      } else {
        cssCreate.cssCreate();
      }
    } catch (err) {
      console_log.consoleLog('error', { err: err });
    }
  },
  getCombos(): any {
    log(values.combos, 'combos');
    return values.combos;
  },
  updateCombo(combo: string, newValues: string[]): void {
    try {
      if (values.combos[combo.toString()]) {
        values.combos[combo] = newValues;
        let classes2Delete: string[] = [];
        for (let createdClass of values.alreadyCreatedClasses) {
          if (classBelongsToCombo(createdClass, combo)) {
            classes2Delete.push(createdClass);
          }
        }
        if (classes2Delete.length > 0) {
          for (let class2Delete of classes2Delete) {
            values.sheet?.deleteRule(
              [...values.sheet.cssRules].findIndex(cssRule => {
                return cssRule.cssText.includes(class2Delete);
              })
            );
            if (values.alreadyCreatedClasses.has(class2Delete)) {
              values.alreadyCreatedClasses.delete(class2Delete);
            }
          }
          if (values.cacheActive) {
            manage_cache.clearAllNoneEssential();
          }
          cssCreate.cssCreate();
        }
      } else {
        throw new Error(`There is no combo named ${combo}.`);
      }
    } catch (err) {
      console_log.consoleLog('error', { err: err });
    }
  },
};
