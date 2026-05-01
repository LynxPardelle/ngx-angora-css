/// <reference types="jasmine" />
import { css_create_diagnostics } from '../../css_create_diagnostics';
import { valueTraductor } from './valueTraductor';

describe('valueTraductor', () => {
  beforeEach(() => {
    css_create_diagnostics.clear();
  });

  it('does not throw when the property token is undefined', () => {
    const result = valueTraductor('red', undefined as unknown as string);
    const report = css_create_diagnostics.getLastReport();

    expect(result).toBe('red');
    expect(report.diagnostics.some(diagnostic => diagnostic.code === 'invalid-property-input')).toBeTrue();
  });
});