import { ValuesSingleton } from '../../../singletons/valuesSingleton';
/* Functions */
import { css_create_diagnostics } from '../../../functions/css_create_diagnostics';
import { color_transform } from '../../../functions/color_transform';
import { console_log } from '../../console_log';
import { shadowGradientCreator } from './shadowGradientCreator';
/* Types */
import { TLogPartsOptions } from '../../../types';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('propertyNValueCorrector', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('propertyNValueCorrector', toLog);
};

const SURFACE_BACKGROUND_COLOR_VAR = '--ank-surface-background-color';
const SURFACE_BACKGROUND_IMAGE_VAR = '--ank-surface-background-image';
const SURFACE_BACKGROUND_POSITION_VAR = '--ank-surface-background-position';
const SURFACE_BACKGROUND_SIZE_VAR = '--ank-surface-background-size';
const SURFACE_BACKGROUND_REPEAT_VAR = '--ank-surface-background-repeat';
const SURFACE_BACKGROUND_ORIGIN_VAR = '--ank-surface-background-origin';
const SURFACE_BACKGROUND_CLIP_VAR = '--ank-surface-background-clip';
const SURFACE_BACKGROUND_ATTACHMENT_VAR = '--ank-surface-background-attachment';
const TEXT_GRADIENT_IMAGE_VAR = '--ank-text-gradient-image';
const TEXT_GRADIENT_FILL_COLOR_VAR = '--ank-text-gradient-fill-color';
const TEXT_GRADIENT_POSITION_VAR = '--ank-text-gradient-position';
const TEXT_GRADIENT_SIZE_VAR = '--ank-text-gradient-size';
const TEXT_GRADIENT_ORIGIN_VAR = '--ank-text-gradient-origin';
const TEXT_GRADIENT_SHADOW_VAR = '--ank-text-gradient-shadow';
const DEFAULT_TEXT_GRADIENT_POSITION = '35% 50%';
const DEFAULT_TEXT_GRADIENT_SIZE = '150% 150%';
const TRANSPARENT_SURFACE_LAYER = 'linear-gradient(transparent,transparent)';

type TParsedBackgroundShorthand = {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundOrigin?: string;
  backgroundClip?: string;
  backgroundAttachment?: string;
};

const isGradientValue = (value: string): boolean => {
  return typeof value === 'string' && value.includes('gradient');
};

const buildGradientColorFallback = (gradientValue: string): string => {
  const colorMatches = color_transform.separateColor4Transform(gradientValue);

  if (!colorMatches || colorMatches.length === 0) {
    return '';
  }

  const fallbackColor = color_transform.colorToRGB(colorMatches[0]);

  return `color:rgba(${fallbackColor[0]},${fallbackColor[1]},${fallbackColor[2]}, 1);`;
};

const buildDescendantResetSelector = (selector: string): string => {
  if (typeof selector !== 'string' || selector.trim().length === 0) {
    return '';
  }

  return selector
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(part => `${part} *`)
    .join(', ');
};

const clearContrastFillDeclarations = (): string => {
  return `${TEXT_GRADIENT_FILL_COLOR_VAR}:initial;`;
};

const buildContrastFillDeclarations = (value: string, opacity: number = 0.18): string => {
  const colorMatches = isGradientValue(value) ? color_transform.separateColor4Transform(value) : [value];

  if (!colorMatches || colorMatches.length === 0) {
    return clearContrastFillDeclarations();
  }

  const averageLuminance =
    colorMatches
      .map(colorMatch => color_transform.colorToRGB(colorMatch))
      .reduce((acc, rgb) => {
        const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        return acc + luminance;
      }, 0) / colorMatches.length;

  const fillRgb = averageLuminance < 140 ? [255, 255, 255] : [0, 0, 0];

  return `${TEXT_GRADIENT_FILL_COLOR_VAR}:rgba(${fillRgb[0]},${fillRgb[1]},${fillRgb[2]},${opacity});`;
};

const parseBackgroundShorthand = (value: string): TParsedBackgroundShorthand => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return {};
  }

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const probe = document.createElement('div');
    probe.style.background = '';
    probe.style.background = value;

    return {
      backgroundColor: probe.style.backgroundColor || '',
      backgroundImage: probe.style.backgroundImage || '',
      backgroundPosition: probe.style.backgroundPosition || '',
      backgroundSize: probe.style.backgroundSize || '',
      backgroundRepeat: probe.style.backgroundRepeat || '',
      backgroundOrigin: probe.style.backgroundOrigin || '',
      backgroundClip: probe.style.backgroundClip || '',
      backgroundAttachment: probe.style.backgroundAttachment || '',
    };
  }

  if (isGradientValue(value)) {
    return {
      backgroundColor: 'transparent',
      backgroundImage: value,
    };
  }

  if (!/\s/.test(value)) {
    return {
      backgroundColor: value,
    };
  }

  return {};
};

const buildBackgroundVariableResetDeclarations = (): string => {
  return `${SURFACE_BACKGROUND_COLOR_VAR}:initial;${SURFACE_BACKGROUND_IMAGE_VAR}:initial;${SURFACE_BACKGROUND_POSITION_VAR}:initial;${SURFACE_BACKGROUND_SIZE_VAR}:initial;${SURFACE_BACKGROUND_REPEAT_VAR}:initial;${SURFACE_BACKGROUND_ORIGIN_VAR}:initial;${SURFACE_BACKGROUND_CLIP_VAR}:initial;${SURFACE_BACKGROUND_ATTACHMENT_VAR}:initial;${TEXT_GRADIENT_IMAGE_VAR}:initial;${TEXT_GRADIENT_POSITION_VAR}:initial;${TEXT_GRADIENT_SIZE_VAR}:initial;${TEXT_GRADIENT_ORIGIN_VAR}:initial;${TEXT_GRADIENT_SHADOW_VAR}:initial;${clearContrastFillDeclarations()}`;
};

const buildSurfaceBackgroundShorthandDeclarations = (value: string): string => {
  const parsedBackground = parseBackgroundShorthand(value);
  const declarations: string[] = [];

  if (parsedBackground.backgroundColor) {
    declarations.push(`${SURFACE_BACKGROUND_COLOR_VAR}:${parsedBackground.backgroundColor};`);
  }

  if (parsedBackground.backgroundImage && parsedBackground.backgroundImage !== 'none') {
    declarations.push(`${SURFACE_BACKGROUND_IMAGE_VAR}:${parsedBackground.backgroundImage};`);
    declarations.push(buildContrastFillDeclarations(parsedBackground.backgroundImage));
  } else {
    declarations.push(clearContrastFillDeclarations());
  }

  if (parsedBackground.backgroundPosition) {
    declarations.push(`${SURFACE_BACKGROUND_POSITION_VAR}:${parsedBackground.backgroundPosition};`);
  }

  if (parsedBackground.backgroundSize) {
    declarations.push(`${SURFACE_BACKGROUND_SIZE_VAR}:${parsedBackground.backgroundSize};`);
  }

  if (parsedBackground.backgroundRepeat) {
    declarations.push(`${SURFACE_BACKGROUND_REPEAT_VAR}:${parsedBackground.backgroundRepeat};`);
  }

  if (parsedBackground.backgroundOrigin) {
    declarations.push(`${SURFACE_BACKGROUND_ORIGIN_VAR}:${parsedBackground.backgroundOrigin};`);
  }

  if (parsedBackground.backgroundClip) {
    declarations.push(`${SURFACE_BACKGROUND_CLIP_VAR}:${parsedBackground.backgroundClip};`);
  }

  if (parsedBackground.backgroundAttachment) {
    declarations.push(`${SURFACE_BACKGROUND_ATTACHMENT_VAR}:${parsedBackground.backgroundAttachment};`);
  }

  declarations.push(`background:${value};`);

  return declarations.join('');
};

const buildSurfaceBackgroundDeclarations = (property2Use: string, value: string): string => {
  switch (property2Use) {
    case 'background':
      return buildSurfaceBackgroundShorthandDeclarations(value);
    case 'background-color':
      if (isGradientValue(value)) {
        return `${SURFACE_BACKGROUND_COLOR_VAR}:transparent;${SURFACE_BACKGROUND_IMAGE_VAR}:${value};${buildContrastFillDeclarations(value)}background-image:${value};`;
      }

      return `${SURFACE_BACKGROUND_COLOR_VAR}:${value};${clearContrastFillDeclarations()}background-color:${value};`;
    case 'background-image':
      return `${SURFACE_BACKGROUND_IMAGE_VAR}:${value};${isGradientValue(value) ? buildContrastFillDeclarations(value) : clearContrastFillDeclarations()}background-image:${value};`;
    case 'background-position':
      return `${SURFACE_BACKGROUND_POSITION_VAR}:${value};background-position:${value};`;
    case 'background-size':
      return `${SURFACE_BACKGROUND_SIZE_VAR}:${value};background-size:${value};`;
    case 'background-repeat':
      return `${SURFACE_BACKGROUND_REPEAT_VAR}:${value};background-repeat:${value};`;
    case 'background-origin':
      return `${SURFACE_BACKGROUND_ORIGIN_VAR}:${value};background-origin:${value};`;
    case 'background-clip':
      return `${SURFACE_BACKGROUND_CLIP_VAR}:${value};background-clip:${value};-webkit-background-clip:${value};`;
    case 'background-attachment':
      return `${SURFACE_BACKGROUND_ATTACHMENT_VAR}:${value};background-attachment:${value};`;
    default:
      return '';
  }
};

const buildGradientTextDeclarations = (gradientValue: string): string => {
  return `${buildGradientColorFallback(gradientValue)}${TEXT_GRADIENT_IMAGE_VAR}:${gradientValue};background-color:var(${SURFACE_BACKGROUND_COLOR_VAR},transparent);background-image:${gradientValue},var(${SURFACE_BACKGROUND_IMAGE_VAR},${TRANSPARENT_SURFACE_LAYER});background-position:var(${TEXT_GRADIENT_POSITION_VAR},${DEFAULT_TEXT_GRADIENT_POSITION}),var(${SURFACE_BACKGROUND_POSITION_VAR},0 0);background-size:var(${TEXT_GRADIENT_SIZE_VAR},${DEFAULT_TEXT_GRADIENT_SIZE}),var(${SURFACE_BACKGROUND_SIZE_VAR},auto);background-repeat:no-repeat,var(${SURFACE_BACKGROUND_REPEAT_VAR},repeat);background-origin:var(${TEXT_GRADIENT_ORIGIN_VAR},border-box),var(${SURFACE_BACKGROUND_ORIGIN_VAR},border-box);background-clip:text,var(${SURFACE_BACKGROUND_CLIP_VAR},border-box);-webkit-background-clip:text,var(${SURFACE_BACKGROUND_CLIP_VAR},border-box);background-attachment:scroll,var(${SURFACE_BACKGROUND_ATTACHMENT_VAR},scroll);text-shadow:var(${TEXT_GRADIENT_SHADOW_VAR},none);-webkit-text-fill-color:transparent;-moz-text-fill-color:transparent;`;
};

export const propertyNValueCorrector = (property2Use: string, value: string, selector: string = ''): string => {
  const normalizedProperty = typeof property2Use === 'string' ? property2Use : '';
  const normalizedValue = typeof value === 'string' ? value : '';
  const normalizedSelector = typeof selector === 'string' ? selector.trim() : '';
  if (!normalizedProperty) {
    css_create_diagnostics.addDiagnostic({
      code: 'invalid-property-correction-input',
      severity: 'warning',
      stage: 'property2ValueJoiner',
      message: 'Skipped property correction because the property token is missing.',
      details: {
        property2Use,
        value,
      },
      suggestedFix: 'Ensure property correction receives a valid property name.',
      recoverable: true,
    });
    return '';
  }

  multiLog([
    [normalizedProperty, 'property2Use'],
    [normalizedValue, 'value'],
  ]);
  let newRule: string = '';
  if (['box-shadow'].includes(normalizedProperty) && normalizedValue.includes('gradient')) {
    let shadowRegex: RegExp =
      /(inset)?(\s?-?[0-9\.]+(?:(px)|(cm)|(mm)|(pt)|(in)|(pc)|(r?em)|(vmin)|(vh)|(vm(ax)?)|(%)|(vw))?\s?){2,4}(([A-z]+\-[A-z]+\([0-9\.]+(?:%|(deg)),\s*)?(((((?:(rgb)|(hsl))a?)\((([0-9]*)(%)?(deg)?,?\s?){1,4}(\/?\s?([0-9\.]*)(%)?\s?)\))|(#[0-9A-Fa-f]{3,8}))(\s*[0-9]*%,?\)?)?)*)(inset)?/g;
    let onlyGradientRegex: RegExp =
      /(([A-z]+\-[A-z]+\([0-9\.]+(?:%|(deg)),\s*)?(((((?:(rgb)|(hsl))a?)\((([0-9]*)(%)?(deg)?,?\s?){1,4}(\/?\s?([0-9\.]*)(%)?\s?)\))|(#[0-9A-Fa-f]{3,8}))(\s*[0-9]*%,?\)?)?)*)/g;
    log(normalizedValue, 'value 4RShadowRegex');
    let shadows2Use: string[] = [''];
    const shadowMatches: RegExpMatchArray | null = normalizedValue.match(shadowRegex);
    log(shadowMatches, 'shadowMatches');
    const gradientMatches: RegExpMatchArray | null = normalizedValue.match(onlyGradientRegex);
    log(gradientMatches, 'gradientMatches');
    let onlyGradient: boolean = false;
    if (!!shadowMatches && shadowMatches.every(a => a.includes('gradient'))) {
      shadows2Use = shadowMatches.filter(a => a !== '' && a.length > 2);
    } else if (!!gradientMatches && gradientMatches.every(a => a.includes('gradient'))) {
      shadows2Use = gradientMatches.filter(a => a !== '' && a.length > 2);
      onlyGradient = true;
    }
    log(shadows2Use, 'shadows2Use');
    let correctedShadows: string[] = shadows2Use.map((a: string) => shadowGradientCreator(a, onlyGradient));
    log(correctedShadows, 'correctedShadows');
    let add2NewRule: string = correctedShadows
      .map((a: string, i: number) => {
        if (i <= 1) {
          return `${values.separator}${values.specify}${i === 0 ? '::before' : '::after'}{${a}`;
        } else {
          return '';
        }
      })
      .join('');
    log(add2NewRule, 'add2NewRule');
    newRule = `transform-style:preserve-3d;}${add2NewRule}`;
    log(newRule, 'newRule WithShadow');
  } else {
    const descendantResetSelector = buildDescendantResetSelector(normalizedSelector);
    if (
      [
        'background',
        'background-color',
        'background-image',
        'background-position',
        'background-size',
        'background-repeat',
        'background-origin',
        'background-clip',
        'background-attachment',
      ].includes(normalizedProperty)
    ) {
      newRule = buildSurfaceBackgroundDeclarations(normalizedProperty, normalizedValue);
    } else if (normalizedProperty === 'color' && isGradientValue(normalizedValue)) {
      newRule = buildGradientTextDeclarations(normalizedValue);
    } else {
      newRule = `${
        normalizedProperty === 'border-color' && normalizedValue.includes('gradient') ? `border-image-source` : normalizedProperty
      }:${normalizedValue};${
        normalizedProperty === 'border-color' && normalizedValue.includes('gradient') ? `border-image-slice:2;border-image-width:2px;` : ''
      }`;
    }

    if (normalizedProperty === 'color' && normalizedValue.includes('gradient') && descendantResetSelector) {
      newRule += `}${values.separator}${descendantResetSelector}{${buildBackgroundVariableResetDeclarations()}text-shadow:none;-webkit-text-fill-color:currentColor;-moz-text-fill-color:currentColor;`;
    } else if (
      [
        'background',
        'background-color',
        'background-image',
        'background-position',
        'background-size',
        'background-repeat',
        'background-origin',
        'background-clip',
        'background-attachment',
      ].includes(normalizedProperty) &&
      descendantResetSelector
    ) {
      newRule += `}${values.separator}${descendantResetSelector}{${buildBackgroundVariableResetDeclarations()}`;
    }
  }
  log(newRule, 'newRule');
  return newRule;
};
