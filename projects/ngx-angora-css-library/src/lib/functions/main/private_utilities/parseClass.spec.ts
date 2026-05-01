/// <reference types="jasmine" />
import { ValuesSingleton } from '../../../singletons/valuesSingleton';
import { css_create_diagnostics } from '../../css_create_diagnostics';
import { comboParser } from './comboParser';
import { parseClass } from './parseClass';

describe('parseClass', () => {
  let values: ValuesSingleton;

  const insertGeneratedRules = (ruleText: string): void => {
    const cssRules = ruleText.split(values.separator).filter(rule => rule.length > 0);

    for (const rule of cssRules) {
      values.sheet?.insertRule(rule, values.sheet.cssRules.length);
    }
  };

  beforeEach(() => {
    values = ValuesSingleton.getInstance();
    values.cacheActive = false;
    values.sheet = { cssRules: [] } as unknown as CSSStyleSheet;
    values.alreadyCreatedClasses.clear();
    css_create_diagnostics.clear();
  });

  it('skips malformed classes before marking them as already created', () => {
    const result = parseClass('ank');
    const report = css_create_diagnostics.getLastReport();

    expect(result.status).toBe('invalid');
    expect(values.alreadyCreatedClasses.has('ank')).toBeFalse();
    expect(report.diagnostics.some(diagnostic => diagnostic.code === 'invalid-class-structure')).toBeTrue();
  });

  it('creates valid rules for value-heavy combos when combo encryption is disabled', () => {
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);

    values.sheet = styleElement.sheet as CSSStyleSheet;
    values.encryptCombo = false;
    values.combos = {
      Abtn: [
        'ank-borderWidth-VAL1DEF4pxDEF',
        'ank-m-VAL2DEF1rem__autoDEF',
        'ank-p-VAL3DEF0_5remDEF',
        'ank-rounded-VAL4DEF0_5remDEF',
      ],
    };
    values.combosKeys = new Set(['Abtn']);
    values.combosCreated = {};
    values.combosCreatedKeys = new Set();
    values.pseudos = [];

    const hostElement = document.createElement('button');
    const generatedClasses = comboParser('AbtnVALSVAL3_4N1remVAL3_4NVL8pxVL2rem__autoVL3rem', 'Abtn', hostElement);
    const paddingClass = generatedClasses.find(className => className.startsWith('ank-p'));

    expect(paddingClass).toContain(values.encryptComboCharacters);

    const parsedRule = parseClass(paddingClass || '');
    const cssRule = parsedRule.classes2CreateStringed.split(values.separator).find(rule => rule.length > 0) || '';

    expect(parsedRule.status).toBe('created');
    expect(cssRule).toContain('.AbtnVALSVAL3_4N1remVAL3_4NVL8pxVL2rem__autoVL3rem');
    expect(cssRule).not.toContain('VAL3.4');
    expect(cssRule).not.toContain(' autoVL3rem');
    expect(() => values.sheet?.insertRule(cssRule, values.sheet.cssRules.length)).not.toThrow();

    styleElement.remove();
  });

  it('builds clipped gradient text rules for gradient color classes', () => {
    const result = parseClass('ank-c-revdankcent');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const cssRule = cssRules[0] || '';
    const descendantResetRule = cssRules[1] || '';

    expect(result.status).toBe('created');
    expect(cssRule).toContain('color:rgba(0,0,0, 1);');
    expect(cssRule).toContain('--ank-text-gradient-image:linear-gradient(220deg, #000 35%,#D01033 55%);');
    expect(cssRule).toContain('background-image:linear-gradient(220deg, #000 35%,#D01033 55%),var(--ank-surface-background-image,linear-gradient(transparent,transparent));');
    expect(cssRule).toContain('background-position:var(--ank-text-gradient-position,35% 50%),var(--ank-surface-background-position,0 0);');
    expect(cssRule).toContain('background-size:var(--ank-text-gradient-size,150% 150%),var(--ank-surface-background-size,auto);');
    expect(cssRule).toContain('background-origin:var(--ank-text-gradient-origin,border-box),var(--ank-surface-background-origin,border-box);');
    expect(cssRule).toContain('background-clip:text,var(--ank-surface-background-clip,border-box);');
    expect(cssRule).toContain('-webkit-background-clip:text,var(--ank-surface-background-clip,border-box);');
    expect(cssRule).toContain('-webkit-text-fill-color:transparent;');
    expect(cssRule).toContain('text-shadow:var(--ank-text-gradient-shadow,none);');
    expect(descendantResetRule).toContain('.ank-c-revdankcent *{');
    expect(descendantResetRule).toContain('--ank-surface-background-image:initial;');
    expect(descendantResetRule).toContain('--ank-text-gradient-position:initial;');
    expect(descendantResetRule).toContain('--ank-text-gradient-size:initial;');
    expect(descendantResetRule).toContain('--ank-text-gradient-origin:initial;');
    expect(descendantResetRule).toContain('--ank-text-gradient-shadow:initial;');
    expect(descendantResetRule).toContain('text-shadow:none;');
    expect(descendantResetRule).toContain('-webkit-text-fill-color:currentColor;');
  });

  it('publishes surface variables for background utilities so gradient text can compose with them', () => {
    const result = parseClass('ank-bg-white');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const cssRule = cssRules[0] || '';
    const descendantResetRule = cssRules[1] || '';

    expect(result.status).toBe('created');
    expect(cssRule).toContain('--ank-surface-background-color:rgba(255,255,255, 1);');
    expect(cssRule).toContain('background-color:rgba(255,255,255, 1);');
    expect(descendantResetRule).toContain('--ank-surface-background-color:initial;');
    expect(descendantResetRule).toContain('--ank-text-gradient-position:initial;');
  });

  it('publishes parsed surface variables for background shorthand values', () => {
    const result = parseClass('ank-BG-white');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const cssRule = cssRules[0] || '';

    expect(result.status).toBe('created');
    expect(cssRule).toContain('--ank-surface-background-color:rgb(255, 255, 255);');
    expect(cssRule).toContain('background:rgba(255,255,255, 1);');
  });

  it('keeps a same-element solid surface visible when gradient text is combined with a background utility', () => {
    const styleElement = document.createElement('style');
    const hostElement = document.createElement('div');

    document.head.appendChild(styleElement);
    values.sheet = styleElement.sheet as CSSStyleSheet;

    insertGeneratedRules(parseClass('ank-bg-white').classes2CreateStringed);
    insertGeneratedRules(parseClass('ank-c-revdankcent').classes2CreateStringed);

    hostElement.className = 'ank-bg-white ank-c-revdankcent';
    hostElement.textContent = 'Gradient text on white';
    document.body.appendChild(hostElement);

    const computedStyles = getComputedStyle(hostElement);

    expect(computedStyles.backgroundColor.replace(/\s+/g, '')).toBe('rgb(255,255,255)');
    expect(computedStyles.backgroundImage).toContain('linear-gradient');

    hostElement.remove();
    styleElement.remove();
  });

  it('offsets the text gradient layer so same-gradient text still renders distinctly from a matching button surface', () => {
    const textRule = parseClass('ank-c-dankcent').classes2CreateStringed;
    const buttonRule = parseClass('ank-btn-dankcent').classes2CreateStringed;

    expect(textRule).toContain('background-position:var(--ank-text-gradient-position,35% 50%),var(--ank-surface-background-position,0 0);');
    expect(textRule).toContain('background-size:var(--ank-text-gradient-size,150% 150%),var(--ank-surface-background-size,auto);');
    expect(buttonRule).toContain('.ank-btn-dankcent.ank-btn-dankcent{');
    expect(buttonRule).toContain('--ank-text-gradient-position:0 0;');
    expect(buttonRule).toContain('--ank-text-gradient-size:100% 100%;');
    expect(buttonRule).toContain('--ank-text-gradient-origin:content-box;');
    expect(buttonRule).toContain('--ank-text-gradient-shadow:none;');
    expect(buttonRule).toContain('.ank-btn-dankcent::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(220deg, #D01033 35%,#000 55%);pointer-events:none;z-index:-1;}');
  });

  it('keeps a same-element shorthand surface visible when gradient text is combined with a background shorthand utility', () => {
    const styleElement = document.createElement('style');
    const hostElement = document.createElement('div');

    document.head.appendChild(styleElement);
    values.sheet = styleElement.sheet as CSSStyleSheet;

    insertGeneratedRules(parseClass('ank-BG-white').classes2CreateStringed);
    insertGeneratedRules(parseClass('ank-c-revdankcent').classes2CreateStringed);

    hostElement.className = 'ank-BG-white ank-c-revdankcent';
    hostElement.textContent = 'Gradient text on shorthand background';
    document.body.appendChild(hostElement);

    const computedStyles = getComputedStyle(hostElement);

    expect(computedStyles.backgroundColor.replace(/\s+/g, '')).toBe('rgb(255,255,255)');
    expect(computedStyles.backgroundImage).toContain('linear-gradient');

    hostElement.remove();
    styleElement.remove();
  });

  it('creates outline button rules that stay transparent until hover and then swap to the second color', () => {
    const result = parseClass('ank-btnOutline-primary-success');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const baseRule = cssRules.find(rule => rule.startsWith('.ank-btnOutline-primary-success{')) || '';
    const hoverRule = cssRules.find(rule => rule.startsWith('.ank-btnOutline-primary-success:hover{')) || '';

    expect(result.status).toBe('created');
    expect(baseRule).toContain('color:rgba(13,110,253, 1);');
    expect(baseRule).toContain('background-color:transparent;');
    expect(baseRule).toContain('border-color:rgba(13,110,253, 1);');
    expect(hoverRule).toContain('color:rgba(25,135,84, 1);');
    expect(hoverRule).toContain('background-color:rgba(13,110,253, 1);');
    expect(hoverRule).toContain('border-color:rgba(13,110,253, 1);');
  });

  it('creates gradient buttons without border-image-source so rounded corners remain intact', () => {
    const result = parseClass('ank-btn-dankcent');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const baseRule = cssRules.find(rule => rule.includes('.ank-btn-dankcent.ank-btn-dankcent')) || '';
    const surfaceRule = cssRules.find(rule => rule.startsWith('.ank-btn-dankcent::before{')) || '';

    expect(result.status).toBe('created');
    expect(result.classes2CreateStringed).not.toContain('border-image-source');
    expect(baseRule).toContain('position:relative;');
    expect(baseRule).toContain('background-color:transparent;');
    expect(baseRule).toContain('border-color:transparent;');
    expect(baseRule).toContain('--ank-text-gradient-position:0 0;');
    expect(baseRule).toContain('--ank-text-gradient-size:100% 100%;');
    expect(baseRule).toContain('--ank-text-gradient-origin:content-box;');
    expect(baseRule).toContain('--ank-text-gradient-shadow:none;');
    expect(baseRule).not.toContain('background-clip:text');
    expect(surfaceRule).toContain('background:linear-gradient(220deg, #D01033 35%,#000 55%);');
    expect(surfaceRule).toContain('z-index:-1;');
    expect(result.classes2CreateStringed).not.toContain('.ank-btn-dankcent::after{');
  });

  it('creates paired filled gradient buttons with an owned text gradient layer', () => {
    const result = parseClass('ank-btn-dankcent-revdankcent');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const baseRule = cssRules.find(rule => rule.includes('.ank-btn-dankcent-revdankcent.ank-btn-dankcent-revdankcent')) || '';

    expect(result.status).toBe('created');
    expect(baseRule).toContain('position:relative;');
    expect(baseRule).toContain('--ank-text-gradient-position:0 0;');
    expect(baseRule).toContain('--ank-text-gradient-size:100% 100%;');
    expect(baseRule).toContain('--ank-text-gradient-origin:content-box;');
    expect(baseRule).toContain('--ank-text-gradient-shadow:none;');
    expect(baseRule).toContain('--ank-surface-background-image:linear-gradient(220deg, #D01033 35%,#000 55%);');
    expect(baseRule).toContain('--ank-text-gradient-image:linear-gradient(220deg, #000 35%,#D01033 55%);');
    expect(baseRule).toContain('background-image:linear-gradient(220deg, #000 35%,#D01033 55%),var(--ank-surface-background-image,linear-gradient(transparent,transparent));');
    expect(baseRule).toContain('-webkit-text-fill-color:transparent;');
    expect(result.classes2CreateStringed).not.toContain('.ank-btn-dankcent-revdankcent::before{');
  });

  it('creates paired filled gradient buttons for non-matching surface and text gradients', () => {
    const result = parseClass('ank-btn-gradsecbank-revdankcent');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const baseRule = cssRules.find(rule => rule.includes('.ank-btn-gradsecbank-revdankcent.ank-btn-gradsecbank-revdankcent')) || '';

    expect(result.status).toBe('created');
    expect(baseRule).toContain('--ank-text-gradient-position:0 0;');
    expect(baseRule).toContain('--ank-text-gradient-size:100% 100%;');
    expect(baseRule).toContain('--ank-text-gradient-origin:content-box;');
    expect(baseRule).toContain('--ank-text-gradient-shadow:none;');
    expect(baseRule).toContain('--ank-surface-background-image:linear-gradient(140deg, #F0B566 35%,#000 55%);');
    expect(baseRule).toContain('--ank-text-gradient-image:linear-gradient(220deg, #000 35%,#D01033 55%);');
    expect(baseRule).toContain('background-image:linear-gradient(220deg, #000 35%,#D01033 55%),var(--ank-surface-background-image,linear-gradient(transparent,transparent));');
    expect(result.classes2CreateStringed).not.toContain('.ank-btn-gradsecbank-revdankcent::before{');
  });

  it('creates gradient outline buttons with a transparent shell, gradient border, and hover fill', () => {
    const result = parseClass('ank-btnOutline-dankcent-revdankcent');
    const cssRules = result.classes2CreateStringed.split(values.separator).filter(rule => rule.length > 0);
    const baseRule =
      cssRules.find(rule => rule.includes('.ank-btnOutline-dankcent-revdankcent.ank-btnOutline-dankcent-revdankcent{')) || '';
    const hoverRule =
      cssRules.find(rule => rule.startsWith('.ank-btnOutline-dankcent-revdankcent.ank-btnOutline-dankcent-revdankcent:hover{')) || '';
    const borderRule = cssRules.find(rule => rule.startsWith('.ank-btnOutline-dankcent-revdankcent::before{')) || '';

    expect(result.status).toBe('created');
    expect(baseRule).toContain('background-color:transparent;');
    expect(baseRule).toContain('border-color:transparent;');
    expect(baseRule).toContain('--ank-text-gradient-position:0 0;');
    expect(baseRule).toContain('--ank-text-gradient-size:100% 100%;');
    expect(baseRule).toContain('--ank-text-gradient-origin:content-box;');
    expect(baseRule).toContain('--ank-text-gradient-shadow:none;');
    expect(hoverRule).toContain('--ank-surface-background-image:linear-gradient(220deg, #D01033 35%,#000 55%);');
    expect(hoverRule).toContain('background-image:linear-gradient(220deg, #000 35%,#D01033 55%),var(--ank-surface-background-image,linear-gradient(transparent,transparent));');
    expect(hoverRule).not.toContain('background-image:var(--ank-surface-background-image,linear-gradient(transparent,transparent));');
    expect(hoverRule).not.toContain('background-clip:var(--ank-surface-background-clip,border-box);');
    expect(hoverRule).not.toContain('-webkit-background-clip:var(--ank-surface-background-clip,border-box);');
    expect(borderRule).toContain('background:linear-gradient(220deg, #D01033 35%,#000 55%) border-box;');
    expect(result.classes2CreateStringed).not.toContain('.ank-btnOutline-dankcent-revdankcent::after{');
  });

  it('preserves adjacent sibling selectors when strengthening gradient outline checked states', () => {
    const result = parseClass('ank-btnOutline-dankcent-revdankcent');

    expect(result.status).toBe('created');
    expect(result.classes2CreateStringed).toContain(
      '.btn-check:checked + .ank-btnOutline-dankcent-revdankcent.ank-btnOutline-dankcent-revdankcent'
    );
  });

  it('prefers the longest combo key when decrypting multi-digit combo selectors', () => {
    values.combosCreated = {
      '■■■1': 'ALayout',
      '■■■13': 'AActionButton',
    };
    values.combosCreatedKeys = new Set(['■■■1', '■■■13']);
    values.pseudos = [];

    const result = parseClass('ank-bgSEL__COM_■■■13-white');
    const cssRule = result.classes2CreateStringed.split(values.separator).find(rule => rule.length > 0) || '';

    expect(result.status).toBe('created');
    expect(cssRule).toContain('.AActionButton');
    expect(cssRule).not.toContain('.ALayout3');
  });
});