import { css_create_diagnostics } from './css_create_diagnostics';
import { parseClass } from './main/private_utilities/parseClass';
import { ValuesSingleton } from '../singletons/valuesSingleton';
import {
  TClassesValidationReport,
  TClassCreationDiagnostic,
  TClassValidationOptions,
  TClassValidationResult,
} from '../types';

const values = ValuesSingleton.getInstance();

const cloneDiagnostic = (diagnostic: TClassCreationDiagnostic): TClassCreationDiagnostic => ({
  ...diagnostic,
  details: diagnostic.details ? { ...diagnostic.details } : undefined,
});

const buildGeneratedRulePreview = (generatedRule: string): string => {
  if (typeof generatedRule !== 'string' || generatedRule.length === 0) {
    return '';
  }

  return generatedRule
    .split(values.separator)
    .map(rule => rule.trim())
    .filter(rule => rule.length > 0)
    .join('\n');
};

const buildValidationResult = (
  className: string,
  diagnostics: TClassCreationDiagnostic[],
  generatedRule: string,
  status: 'created' | 'duplicate' | 'invalid',
  breakpoint?: TClassValidationResult['breakpoint']
): TClassValidationResult => ({
  className,
  normalizedClassName: className.trim(),
  status: status === 'created' ? 'valid' : status,
  valid: status !== 'invalid',
  canCreate: status === 'created',
  generatedRule: buildGeneratedRulePreview(generatedRule),
  breakpoint,
  diagnostics: diagnostics.map(cloneDiagnostic),
});

export const validate_class = {
  validateClass(className: string, options: TClassValidationOptions = {}): TClassValidationResult {
    const normalizedClassName = typeof className === 'string' ? className : '';
    const diagnostics: TClassCreationDiagnostic[] = [];

    const parsedResult = css_create_diagnostics.runWithRecordingSuspended(() =>
      parseClass(normalizedClassName, false, {
        mutateState: false,
        requireSheet: options.requireSheet ?? false,
        checkDuplicates: options.checkDuplicates ?? false,
        recordDiagnostics: false,
        diagnostics,
      })
    );

    return buildValidationResult(
      normalizedClassName,
      diagnostics,
      parsedResult.classes2CreateStringed,
      parsedResult.status,
      parsedResult.bps
    );
  },

  validateClasses(classNames: string[], options: TClassValidationOptions = {}): TClassesValidationReport {
    const results = (Array.isArray(classNames) ? classNames : []).map(className => this.validateClass(className, options));

    return {
      results,
      validClasses: results.filter(result => result.status === 'valid').length,
      invalidClasses: results.filter(result => result.status === 'invalid').length,
      duplicateClasses: results.filter(result => result.status === 'duplicate').length,
    };
  },
};