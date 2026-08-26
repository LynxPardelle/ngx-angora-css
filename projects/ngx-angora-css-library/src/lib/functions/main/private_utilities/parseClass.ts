/* Singletons */
import { ValuesSingleton } from '../../../singletons/valuesSingleton';
/* Interfaces */
/* Functions */
import { css_create_diagnostics } from '../../../functions/css_create_diagnostics';
import { console_log } from '../../../functions/console_log';
import { abreviation_traductors } from '../../abreviation_traductors';
import { manage_cache } from '../../manage_cache';
import { convertPseudos } from './convertPseudos';
import { decryptCombo } from './decryptCombo';
import { look4BPNVals } from './look4BPNVals';
import { property2ValueJoiner } from './property2ValueJoiner';
import { valueTraductor } from './valueTraductor';
/* Types */
import { TBPS, TClassCreationDiagnostic, TLogPartsOptions } from '../../../types';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('parseClass', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('parseClass', toLog);
};
interface IparseClassReturn {
  classes2CreateStringed: string;
  bps?: TBPS;
  status: 'created' | 'duplicate' | 'invalid';
}

type TParseClassOptions = {
  mutateState?: boolean;
  requireSheet?: boolean;
  checkDuplicates?: boolean;
  recordDiagnostics?: boolean;
  diagnostics?: TClassCreationDiagnostic[];
  existingStylesheetClasses?: ReadonlySet<string>;
};

const buildEmptyResult = (status: IparseClassReturn['status'] = 'invalid'): IparseClassReturn => ({
  classes2CreateStringed: '',
  status,
});

const cloneDiagnostic = (diagnostic: TClassCreationDiagnostic): TClassCreationDiagnostic => ({
  ...diagnostic,
  details: diagnostic.details ? { ...diagnostic.details } : undefined,
});

const recordDiagnostic = (diagnostic: TClassCreationDiagnostic, options: TParseClassOptions): void => {
  if (Array.isArray(options.diagnostics)) {
    options.diagnostics.push(cloneDiagnostic(diagnostic));
  }

  if (options.recordDiagnostics !== false) {
    css_create_diagnostics.addDiagnostic(diagnostic);
  }
};

const reportInvalidClass = (
  options: TParseClassOptions,
  className: string,
  code: string,
  message: string,
  details?: Record<string, unknown>,
  suggestedFix: string = 'Review the class tokens before retrying CSS creation.'
): void => {
  recordDiagnostic(
    {
    code,
    severity: 'warning',
    stage: 'parseClass',
    className,
    message,
    details,
    suggestedFix,
    recoverable: true,
    },
    options
  );
};

const findMatchingCreatedComboKey = (value: string): string | undefined => {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }

  let matchedComboKey: string | undefined;
  for (const comboKey of values.combosCreatedKeys) {
    if (!value.includes(comboKey)) {
      continue;
    }

    if (!matchedComboKey || comboKey.length > matchedComboKey.length) {
      matchedComboKey = comboKey;
    }
  }

  return matchedComboKey;
};
/**
 * Parses a CSS class string and converts it into valid CSS rules with breakpoint support.
 *
 * This function takes a class name with abbreviated CSS properties and values, processes it through
 * various transformations including abbreviation expansion, pseudo-class conversion, breakpoint handling,
 * and value translation to generate valid CSS rules.
 *
 * @param class2Create - The CSS class name to parse and create (may contain abbreviations)
 * @param classes2CreateStringed - Accumulated string of CSS classes being created
 * @param isClean - Whether to check for already created classes to avoid duplicates (default: true)
 *
 * @returns Object containing:
 *   - classes2CreateStringed: Updated accumulated CSS classes string
 *
 * @example
 * ```typescript
 * parseClass('bef-overflowX-hidden', [], '', true):
 * {
 *   classes2CreateStringed: '.bef-overflowX-hidden{overflow-x:hidden !important;}þµÞ'
 * }
 * ```
 *
 * @remarks
 * - Handles abbreviation expansion (e.g., 'm' to 'margin')
 * - Processes pseudo-classes and combinators
 * - Supports breakpoint-specific styling
 * - Applies important flags when active
 * - Maintains cache of already created classes to prevent duplicates
 * - Supports encrypted combo classes when encryption is enabled
 */
export const parseClass = (
  class2Create: string,
  isClean: boolean = true,
  options: TParseClassOptions = {}
): IparseClassReturn => {
  const parseOptions: TParseClassOptions = {
    mutateState: options.mutateState ?? true,
    requireSheet: options.requireSheet ?? (options.mutateState ?? true),
    checkDuplicates: options.checkDuplicates ?? isClean,
    recordDiagnostics: options.recordDiagnostics ?? true,
    diagnostics: options.diagnostics,
    existingStylesheetClasses: options.existingStylesheetClasses,
  };

  if (typeof class2Create !== 'string' || class2Create.trim().length === 0) {
    reportInvalidClass(
      parseOptions,
      String(class2Create),
      'invalid-class-input',
      'Skipped CSS creation because the class name is empty or not a string.',
      { class2Create },
      'Ensure every class passed to cssCreate is a non-empty string.'
    );
    return buildEmptyResult();
  }

  const originalClassName = class2Create.trim();
  class2Create = originalClassName;

  if (parseOptions.requireSheet && !values.sheet) {
    recordDiagnostic(
      {
        code: 'stylesheet-missing',
        severity: 'error',
        stage: 'setup',
        className: originalClassName,
        message: 'Skipped CSS creation because the main stylesheet is not available.',
        suggestedFix: 'Make sure the managed stylesheet exists before requesting new CSS rules.',
        recoverable: false,
      },
      parseOptions
    );
    return buildEmptyResult();
  }

  multiLog([[isClean, 'isClean']]);
  if (parseOptions.checkDuplicates) {
    if (parseOptions.mutateState && values.cacheActive) {
      const cachedResult = manage_cache.getCached<{
        classes2CreateStringed: string;
        bps?: TBPS;
        status: 'created';
      }>(originalClassName, 'parseClass');
      if (cachedResult) {
        if (parseOptions.mutateState) {
          values.alreadyCreatedClasses.add(originalClassName);
        }
        return {
          classes2CreateStringed: cachedResult.classes2CreateStringed,
          bps: cachedResult.bps,
          status: 'created',
        };
      }
    }
    if (
      values.alreadyCreatedClasses.has(originalClassName) ||
      parseOptions.existingStylesheetClasses?.has(originalClassName) ||
      (parseOptions.existingStylesheetClasses === undefined &&
        !!values.sheet &&
        [...values.sheet.cssRules].find((i: CSSRule) =>
          i.cssText.split(' ').find((aC: string) => {
            return aC.replace('.', '') === originalClassName;
          })
        ))
    ) {
      if (parseOptions.mutateState) {
        values.alreadyCreatedClasses.add(originalClassName);
      }
      return buildEmptyResult('duplicate');
    }
  }

  log(values.alreadyCreatedClasses, 'alreadyCreatedClasses');
  let class2CreateStringed = '.' + originalClassName;
  log(class2CreateStringed, 'class2CreateStringed');

  if (!class2Create.includes(values.indicatorClass)) {
    const abbrClss = Object.keys(values.abreviationsClasses).find(aC => class2Create.includes(aC));
    const abreviationValue = abbrClss ? values.abreviationsClasses[abbrClss] : undefined;
    if (abbrClss && typeof abreviationValue === 'string' && abreviationValue.length > 0) {
      class2Create = class2Create.replace(abbrClss, abreviationValue);
    }
  }

  const class2CreateSplited = class2Create.split('-');
  log(class2CreateSplited, 'class2CreateSplited');
  if (class2CreateSplited.length < 2 || typeof class2CreateSplited[1] !== 'string' || !class2CreateSplited[1]) {
    reportInvalidClass(
      parseOptions,
      originalClassName,
      'invalid-class-structure',
      'Skipped CSS creation because the class does not contain a valid property token.',
      { class2CreateSplited },
      'Use a class shape like indicator-property-value so the parser can resolve the property.'
    );
    return buildEmptyResult();
  }

  const comboCreatedKey = findMatchingCreatedComboKey(class2Create);
  if (comboCreatedKey) {
    const comboKeyReg = new RegExp(comboCreatedKey, 'g');
    class2CreateSplited[1] = class2CreateSplited[1].replace(comboKeyReg, values.encryptComboCreatedCharacters);
  }

  const classWithPseudosConvertedAndSELSplited = convertPseudos(class2CreateSplited[1])
    .replace(/SEL/g, values.separator)
    .split(`${values.separator}`);

  log(classWithPseudosConvertedAndSELSplited, 'classWithPseudosConvertedAndSELSplited');

  const property = classWithPseudosConvertedAndSELSplited[0];
  log(property, 'property');
  if (!property) {
    reportInvalidClass(
      parseOptions,
      originalClassName,
      'missing-property-token',
      'Skipped CSS creation because the parser could not resolve a property token.',
      { class2CreateSplited, classWithPseudosConvertedAndSELSplited },
      'Make sure the class contains a known property segment before the value tokens.'
    );
    return buildEmptyResult();
  }

  const specifyParts = classWithPseudosConvertedAndSELSplited.slice(1);
  let specify: string = abreviation_traductors.abreviationTraductor(specifyParts.join(''));

  if (comboCreatedKey) {
    const comboKeyCypherReg = values.cacheActive
      ? (manage_cache.getCached<RegExp>(
          `comboKeyCypherReg|${class2Create}`,
          'regExp',
          () => new RegExp(values.encryptComboCreatedCharacters, 'g')
        ) as RegExp)
      : new RegExp(values.encryptComboCreatedCharacters, 'g');
    class2CreateSplited[1] = class2CreateSplited[1].replace(comboKeyCypherReg, comboCreatedKey);
    multiLog([
      [specify, 'specify PreComboKeyRestoration'],
      [class2Create, 'class2Create PreComboKeyRestoration'],
      [class2CreateStringed, 'class2CreateStringed PreComboKeyRestoration'],
    ]);
    specify = specify.replace(comboKeyCypherReg, comboCreatedKey);
    class2Create = class2Create.replace(comboKeyCypherReg, comboCreatedKey);
    class2CreateStringed = class2CreateStringed.replace(comboKeyCypherReg, comboCreatedKey);
    multiLog([
      [specify, 'specify PostComboKeyRestoration'],
      [class2Create, 'class2Create PostComboKeyRestoration'],
      [class2CreateStringed, 'class2CreateStringed PostComboKeyRestoration'],
    ]);
  }

  if (!!specify && comboCreatedKey) {
    multiLog([
      [specify, 'specify PreDecryptCombo'],
      [class2Create, 'class2Create PreDecryptCombo'],
      [class2CreateStringed, 'class2CreateStringed PreDecryptCombo'],
    ]);
    [specify, class2Create, class2CreateStringed] = decryptCombo(specify, class2Create, class2CreateStringed);
    multiLog([
      [specify, 'specify PostDecryptCombo'],
      [class2Create, 'class2Create PostDecryptCombo'],
      [class2CreateStringed, 'class2CreateStringed PostDecryptCombo'],
    ]);
  }

  const bpResult = look4BPNVals(class2CreateSplited);
  const [hasBP, propertyValues]: [boolean, string[]] = Object.values(bpResult) as [boolean, string[]];

  multiLog([
    [hasBP, 'hasBP'],
    [propertyValues, 'propertyValues'],
  ]);

  const translatedValues = propertyValues.map((pv: string) => {
    return valueTraductor(pv, property);
  });

  log(translatedValues, 'translatedValues');
  if (!translatedValues[0]) {
    translatedValues[0] = 'default';
  }
  multiLog([
    [translatedValues, 'translatedValues AfterValueTraductor'],
    [class2CreateSplited, 'class2CreateStringed BeforeProperty2ValueJoiner'],
  ]);

  const joinedRule = property2ValueJoiner(
    property,
    class2CreateSplited,
    class2Create,
    translatedValues,
    specify,
    `${class2CreateStringed}${specify}`
  );
  if (!joinedRule) {
    reportInvalidClass(
      parseOptions,
      originalClassName,
      'invalid-rule-fragment',
      'Skipped CSS creation because the parser could not build a CSS rule fragment.',
      {
        property,
        class2CreateSplited,
        translatedValues,
        specify,
      },
      'Check that the property and values are valid and resolve to a concrete CSS declaration.'
    );
    return buildEmptyResult();
  }

  class2CreateStringed += joinedRule;

  log(class2CreateStringed, 'class2CreateStringed AfterProperty2ValueJoiner');

  if (!!values.importantActive) {
    const importantRegex = values.cacheActive
      ? (manage_cache.getCached<RegExp>(
          `importantRegex|${class2Create}`,
          'regExp',
          () => new RegExp('\\s?!important\\s?', 'g')
        ) as RegExp)
      : new RegExp('\\s?!important\\s?', 'g');
    for (const cssProperty of class2CreateStringed.split(';')) {
      if (!cssProperty.includes('!important') && cssProperty.length > 5) {
        class2CreateStringed = class2CreateStringed
          .replace(cssProperty, cssProperty + ' !important')
          .replace(importantRegex, ' !important');
      }
    }
  }

  log(class2CreateStringed, 'class2CreateStringed AfterImportant');
  let classes2CreateStringed = '';
  let bps: TBPS | undefined;
  if (class2CreateStringed.includes('{') && class2CreateStringed.includes('}')) {
    if (hasBP === true) {
      const separatorRegex = values.cacheActive
        ? (manage_cache.getCached<RegExp>(
            `separatorRegex|${class2Create}`,
            'regExp',
            () => new RegExp(values.separator, 'g')
          ) as RegExp)
        : new RegExp(values.separator, 'g');
      class2CreateStringed = class2CreateStringed.replace(separatorRegex, '');

      const targetBp = class2CreateSplited[2];
      for (let i = 0; i < values.bps.length; i++) {
        if (values.bps[i].bp === targetBp) {
          bps = {
            bp: targetBp,
            value: values.bps[i].value,
            class2Create: class2CreateStringed,
          };
          break;
        }
      }
    } else {
      classes2CreateStringed += class2CreateStringed + values.separator;
    }
  } else {
    reportInvalidClass(
      parseOptions,
      originalClassName,
      'invalid-css-rule-shape',
      'Skipped CSS creation because the generated CSS rule is incomplete.',
      { class2CreateStringed },
      'Inspect the generated property/value combination and make sure it produces a valid CSS block.'
    );
    return buildEmptyResult();
  }

  classes2CreateStringed = classes2CreateStringed.replace(/\s+/g, ' ');

  multiLog([[classes2CreateStringed, 'classes2CreateStringed AfterSeparators']]);

  const result = {
    classes2CreateStringed: classes2CreateStringed,
    bps: bps,
    status: 'created' as const,
  };

  if (parseOptions.mutateState) {
    values.alreadyCreatedClasses.add(originalClassName);
  }

  if (parseOptions.mutateState && values.cacheActive) {
    manage_cache.addCached(originalClassName, 'parseClass', result);
  }

  return result;
};
