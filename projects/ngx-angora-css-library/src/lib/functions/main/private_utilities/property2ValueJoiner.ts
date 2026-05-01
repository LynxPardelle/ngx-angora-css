/* Singletons */
import { ValuesSingleton } from '../../../singletons/valuesSingleton';
/* Functions */
import { css_create_diagnostics } from '../../../functions/css_create_diagnostics';
import { css_camel } from '../../css-camel';
import { manage_cache } from '../../manage_cache';
import { btnCreator } from './btnCreator';
import { propertyNValueCorrector } from './propertyNValueCorrector';
const values: ValuesSingleton = ValuesSingleton.getInstance();

const SURFACE_BACKGROUND_PROPERTIES = new Set([
  'background',
  'background-color',
  'background-image',
  'background-position',
  'background-size',
  'background-repeat',
  'background-origin',
  'background-clip',
  'background-attachment',
]);

const buildPropertyFragment = (propertyName: string, value: string, selector: string): string => {
  if (
    SURFACE_BACKGROUND_PROPERTIES.has(propertyName) ||
    (typeof value === 'string' && value.includes('gradient') && ['color', 'border-color'].includes(propertyName))
  ) {
    return propertyNValueCorrector(propertyName, value, selector);
  }

  return `${propertyName}:${value};`;
};

/**
 * Pre-defined CSS rule templates for common patterns
 */
const CSS_TEMPLATES = {
  single: (specify: string, property: string, value: string) => `${specify}{${property}:${value};}`,
  multiple: (specify: string, properties: string[]) => `${specify}{${properties.join('')}}`,
  link: (specify: string, value: string) => ` a${specify}{color:${value};}`,
} as const;

/**
 * Optimized property-value CSS joiner with intelligent caching and streamlined algorithms.
 *
 * This function efficiently processes CSS property and value combinations to generate valid CSS rules.
 * It handles special cases like button generation, link styling, and complex CSS property mappings
 * while maintaining high performance through intelligent caching and optimized algorithms.
 *
 * @param property - The CSS property name to process
 * @param class2CreateSplited - Array of class name segments after splitting
 * @param class2Create - The complete class name being created
 * @param propertyValues - Array of property values to apply (default: [''])
 * @param specify - The CSS selector specification (including pseudo-classes/combinators)
 *
 * @returns String resolving to a CSS rule string
 *
 * @example
 * ```typescript
 * // Regular property
 * property2ValueJoiner('margin', ['bef', 'margin', '10px'], 'bef-margin-10px', ['10px'], '');
 * // Button generation
 * property2ValueJoiner('btn', ['bef', 'btn', 'primary'], 'bef-btn-primary', ['#007bff'], ':hover');
 * // Link styling
 * property2ValueJoiner('link', ['bef', 'link', 'blue'], 'bef-link-blue', ['blue'], '');
 * ```
 *
 * @remarks
 * **Performance Optimizations:**
 * - Intelligent caching system for complete CSS generation results
 * - Cached camelCase conversions to avoid repeated property name processing
 * - Optimized property type detection using efficient string matching
 * - Pre-defined CSS templates for common patterns to reduce string operations
 * - Early validation and exit strategies for invalid inputs
 * - Streamlined array processing with minimal allocations
 * - Cache size management with automatic cleanup to prevent memory leaks
 *
 * **Supported Property Types:**
 * - **CSS Names Parsed**: Complex property mappings from ValuesSingleton
 * - **Button Generation**: Special handling for 'btn' and 'btnOutline' prefixes
 * - **Link Styling**: Special anchor tag styling for 'link' prefix
 * - **Default Properties**: Standard CSS property-value pairs
 *
 * **CSS Generation Features:**
 * - Single property CSS rules for simple mappings
 * - Multiple property CSS rules for complex mappings
 * - Button CSS generation with full state support (hover, focus, active)
 * - Link-specific styling with anchor tag targeting
 * - Automatic property name conversion from camelCase to kebab-case
 *
 * **Cache Management:**
 * - CSS generation cache for instant repeated rule creation
 * - CamelCase conversion cache for property name transformations
 * - Automatic cache cleanup to prevent memory leaks
 * - Efficient cache key generation for optimal lookup performance
 *
 * **Backward Compatibility:**
 * - Maintains identical CSS output to original implementation
 * - Same function signature and return type
 * - All existing CSS generation patterns continue to work correctly
 * - Full support for all button variants and special cases
 */
export const property2ValueJoiner = (
  property: string,
  class2CreateSplited: string[],
  class2Create: string,
  propertyValues: string[] = [''],
  specify: string = '',
  selector: string = ''
): string => {
  // Early validation
  if (typeof property !== 'string' || (!property && !class2CreateSplited[1])) {
    css_create_diagnostics.addDiagnostic({
      code: 'missing-property-token',
      severity: 'warning',
      stage: 'property2ValueJoiner',
      className: class2Create,
      message: 'Skipped CSS rule generation because the property token is missing.',
      details: {
        property,
        class2CreateSplited,
      },
      suggestedFix: 'Make sure the class contains a valid property segment before building CSS rules.',
      recoverable: true,
    });
    return '';
  }

  const normalizedPropertyValues = Array.isArray(propertyValues) && propertyValues.length > 0 ? propertyValues : [''];

  // Check cache first for instant response
  let cacheKey: string | undefined;
  if (values.cacheActive) {
    cacheKey = `${property}|${class2CreateSplited.join('-')}|${class2Create}|${normalizedPropertyValues.join(',')}|${specify}|${selector}`;
    const cachedResult = values.propertyJoinerCache.get(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
  }

  let result: string;

  // Check if property exists in cssNamesParsed first (most common case)
  if (values.cssNamesParsed[property]) {
    const cssNameParsed = values.cssNamesParsed[property];

    if (typeof cssNameParsed === 'string') {
      result = CSS_TEMPLATES.multiple(specify, [buildPropertyFragment(cssNameParsed, normalizedPropertyValues[0], selector)]);
    } else {
      // Optimized array processing with pre-allocated array
      const properties: string[] = [];
      const length = cssNameParsed.length;

      for (let i = 0; i < length; i++) {
        const value = normalizedPropertyValues[i] || normalizedPropertyValues[0] || '';
        properties.push(buildPropertyFragment(cssNameParsed[i], value, selector));
      }

      result = CSS_TEMPLATES.multiple(specify, properties);
    }
  } else {
    // Optimized property type detection
    let propertyType = '';

    const secondElement = typeof class2CreateSplited[1] === 'string' ? class2CreateSplited[1] : '';

    // Use startsWith for most efficient prefix matching
    if (secondElement.startsWith('btnOutline')) {
      propertyType = 'btnOutline';
    } else if (secondElement.startsWith('btn')) {
      propertyType = 'btn';
    } else if (secondElement.startsWith('link')) {
      propertyType = 'link';
    }
    if (propertyType === 'link') {
      result = CSS_TEMPLATES.link(specify, normalizedPropertyValues[0]);
    } else if (propertyType === 'btnOutline') {
      result = btnCreator(class2Create, specify, normalizedPropertyValues[0], normalizedPropertyValues[1] || '', true);
    } else if (propertyType === 'btn') {
      result = btnCreator(class2Create, specify, normalizedPropertyValues[0], normalizedPropertyValues[1] || '');
    } else {
      // Default case: standard CSS property-value pair
      const cssProperty = css_camel.camelToCSSValid(property);
      result = CSS_TEMPLATES.multiple(specify, [buildPropertyFragment(cssProperty, normalizedPropertyValues[0], selector)]);
    }
  }
  if (values.cacheActive && cacheKey) {
    manage_cache.addCached<string>(cacheKey, 'propertyJoiner', result);
  }

  return result;
};
