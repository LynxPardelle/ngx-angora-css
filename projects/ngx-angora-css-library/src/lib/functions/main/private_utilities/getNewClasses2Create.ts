import { ValuesSingleton } from '../../../singletons/valuesSingleton';
/* Funtions */
import { css_create_diagnostics } from '../../../functions/css_create_diagnostics';
import { console_log } from '../../console_log';
import { manage_cache } from '../../manage_cache';
import { comboParser } from './comboParser';
/* Types */
import { TLogPartsOptions } from '../../../types';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('getNewClasses2Create', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('getNewClasses2Create', toLog);
};

const findMatchingCombo = (item: string): string | undefined => {
  let matchedCombo: string | undefined;

  for (const comboName of values.combosKeys) {
    if (item !== comboName && !item.startsWith(comboName)) {
      continue;
    }

    if (!matchedCombo || comboName.length > matchedCombo.length) {
      matchedCombo = comboName;
    }
  }

  return matchedCombo;
};

export const getNewClasses2Create = (): string[] => {
  multiLog([
    [values.combos, 'combos'],
    [values.indicatorClass, 'indicatorClass'],
    [values.abreviationsClasses, 'abreviationsClasses'],
    [values.alreadyCreatedClasses, 'alreadyCreatedClasses'],
  ]);

  // Create a lightweight cache key based on the current state
  const allElementsWithClassAtribute: NodeListOf<HTMLElement> = document.querySelectorAll('[class]');
  let cacheKey: string | undefined;
  if (values.cacheActive) {
    cacheKey = `${values.indicatorClass}_${values.combosKeys.size}_${values.abreviationsClassesKeys.size}_${
      values.abreviationsValuesKeys.size
    }_${values.alreadyCreatedClasses.size}_${allElementsWithClassAtribute.length}_${Math.floor(Date.now() / 1000)}`;

    // Try to get cached result first
    const cachedResult = manage_cache.getCached<string[]>(cacheKey, 'getNewClasses2Create');

    if (cachedResult !== null && cachedResult !== undefined) {
      log(cachedResult, 'cached classes2Create');
      return cachedResult;
    }
  }

  const classes2Create: Set<string> = new Set();
  // Get all HTMLElements
  for (let i = 0; i < allElementsWithClassAtribute.length; i++) {
    const value = allElementsWithClassAtribute[i] as HTMLElement;
    for (const item of allElementsWithClassAtribute[i].classList) {
      const itemParts = item.split('-');
      const isManagedClassCandidate =
        item !== values.indicatorClass &&
        (item.startsWith(values.indicatorClass) || values.abreviationsClassesKeys.has(itemParts[0]));

      if (isManagedClassCandidate && (itemParts.length < 2 || !itemParts[1])) {
        css_create_diagnostics.addDiagnostic({
          code: 'invalid-class-discovered',
          severity: 'warning',
          stage: 'discovery',
          className: item,
          message: 'Skipped a managed class candidate because it does not contain a property token.',
          details: {
            elementTagName: value.tagName,
            elementClassName: value.className,
          },
          suggestedFix: 'Use a class shape like indicator-property-value so discovery does not forward malformed classes.',
          recoverable: true,
        });
        continue;
      }

      const comb = findMatchingCombo(item);

      if (!!comb && values.combos[comb]) {
        comboParser(item, comb, allElementsWithClassAtribute[i]).forEach((c: string) => {
          if (!classes2Create.has(c) && !values.alreadyCreatedClasses.has(c)) {
            classes2Create.add(c);
          }
        });
      } else if (
        !comb &&
        !classes2Create.has(item) &&
        !values.alreadyCreatedClasses.has(item) &&
        isManagedClassCandidate
      ) {
        classes2Create.add(item);
      }
    }
  }
  const result = Array.from(classes2Create);
  log(result, 'classes2Create');

  // Cache the final result
  if (values.cacheActive && cacheKey) {
    manage_cache.addCached(cacheKey, 'getNewClasses2Create', result);
  }

  return result;
};
