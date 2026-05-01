/// <reference types="jasmine" />
import { ValuesSingleton } from '../../../singletons/valuesSingleton';
import { getNewClasses2Create } from './getNewClasses2Create';

describe('getNewClasses2Create', () => {
  let values: ValuesSingleton;
  let hostElement: HTMLDivElement;

  beforeEach(() => {
    values = ValuesSingleton.getInstance();
    values.cacheActive = false;
    values.combos = {
      APanel: ['ank-bg-white'],
      APanelStack: ['ank-d-grid'],
    };
    values.combosKeys = new Set(['APanel', 'APanelStack']);
    values.combosCreated = {};
    values.combosCreatedKeys = new Set();
    values.alreadyCreatedClasses.clear();
    values.pseudos = [];
    hostElement = document.createElement('div');
    hostElement.innerHTML = '<section class="APanel"></section><aside class="APanelStack"></aside>';
    document.body.appendChild(hostElement);
  });

  afterEach(() => {
    hostElement.remove();
  });

  it('prefers the longest matching combo name when combo names overlap', () => {
    const classesToCreate = getNewClasses2Create();

    expect(classesToCreate.some(className => className.startsWith('ank-bgSEL__COM_'))).toBeTrue();
    expect(classesToCreate.some(className => className.startsWith('ank-dSEL__COM_'))).toBeTrue();
    expect(classesToCreate.some(className => className.includes('APanelStack'))).toBeFalse();
    expect(Array.from(values.combosCreatedKeys).length).toBe(2);
    expect(Object.values(values.combosCreated)).toContain('APanel');
    expect(Object.values(values.combosCreated)).toContain('APanelStack');
  });
});