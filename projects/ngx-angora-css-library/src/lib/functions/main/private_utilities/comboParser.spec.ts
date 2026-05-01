/// <reference types="jasmine" />
import { ValuesSingleton } from '../../../singletons/valuesSingleton';
import { comboParser } from './comboParser';

describe('comboParser', () => {
  let values: ValuesSingleton;

  beforeEach(() => {
    values = ValuesSingleton.getInstance();
    values.cacheActive = false;
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
    values.encryptCombo = true;
  });

  it('expands combo values with shared indexes into concrete classes', () => {
    const hostElement = document.createElement('button');
    const result = comboParser('AbtnVALSVAL3_4N1remVAL3_4NVL8pxVL2rem__autoVL3rem', 'Abtn', hostElement);

    expect(result.length).toBe(4);
    expect(result.some(className => className.includes('ank-borderWidthSEL__COM_') && className.includes('8px'))).toBeTrue();
    expect(result.some(className => className.includes('ank-roundedSEL__COM_') && className.includes('1rem'))).toBeTrue();
    expect(values.combosCreatedKeys.size).toBe(1);
  });
});