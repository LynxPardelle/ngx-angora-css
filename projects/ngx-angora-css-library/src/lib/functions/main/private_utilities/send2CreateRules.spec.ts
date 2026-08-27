import { ValuesSingleton } from '../../../singletons/valuesSingleton';
import { send2CreateRules } from './send2CreateRules';

describe('numeric breakpoint cascade', () => {
  const values = ValuesSingleton.getInstance();
  let style: HTMLStyleElement;
  let previousSheet: typeof values.responsiveSheet;
  let previousLimit: boolean;

  beforeEach(() => {
    previousSheet = values.responsiveSheet;
    previousLimit = values.limitBPS;
    values.limitBPS = false;
    style = document.createElement('style');
    document.head.appendChild(style);
    values.responsiveSheet = style.sheet!;
  });

  afterEach(() => {
    values.responsiveSheet = previousSheet;
    values.limitBPS = previousLimit;
    style.remove();
  });

  const emit = (widths: number[]) => send2CreateRules('', widths.map(width => ({
    bp: `px${width}`, value: `${width}px`, class2Create: `.grid{grid-template-columns:repeat(${width === 901 ? 4 : width === 641 ? 3 : 2},1fr);}`,
  })));
  const widths = () => Array.from(style.sheet!.cssRules).map(rule =>
    Number((rule as CSSMediaRule).conditionText.match(/min-width:\s*(\d+)px/)?.[1]));

  it('orders overlapping min-width rules ascending in one reversed batch', () => {
    emit([901, 641, 561]);
    expect(widths()).toEqual([561, 641, 901]);
  });

  it('inserts later smaller thresholds before existing larger ones and replays idempotently', () => {
    emit([901]);
    emit([561]);
    emit([641]);
    const before = Array.from(style.sheet!.cssRules).map(rule => rule.cssText);
    emit([901, 561, 641]);
    expect(widths()).toEqual([561, 641, 901]);
    expect(Array.from(style.sheet!.cssRules).map(rule => rule.cssText)).toEqual(before);
  });

  it('appends later larger thresholds after smaller ones', () => {
    emit([561]);
    emit([901]);
    expect(widths()).toEqual([561, 901]);
  });

  it('preserves named breakpoint order and isolates a numeric alias at the same width', () => {
    send2CreateRules('', [
      { bp: 'md', value: '768px', class2Create: '.legacy{color:red;}' },
      { bp: 'lg', value: '992px', class2Create: '.legacy{color:blue;}' },
    ]);
    const namedBefore = Array.from(style.sheet!.cssRules).map(rule => rule.cssText);
    emit([768, 561, 901]);
    const rules = Array.from(style.sheet!.cssRules) as CSSMediaRule[];
    expect(rules.filter(rule => rule.conditionText.startsWith('only screen')).map(rule => rule.cssText)).toEqual(namedBefore);
    expect(rules.filter(rule => rule.conditionText.startsWith('screen')).map(rule => rule.conditionText))
      .toEqual([561, 768, 901].map(width => `screen and (min-width: ${width}px)`));
  });

  it('keeps bounded mode and noncanonical aliases on the legacy path', () => {
    values.limitBPS = true;
    emit([901, 561]);
    expect(Array.from(style.sheet!.cssRules).every(rule => (rule as CSSMediaRule).conditionText.startsWith('only screen'))).toBeTrue();
    expect(style.sheet!.cssRules[1].cssText).toContain('max-width: 901px');
    values.limitBPS = false;
    send2CreateRules('', [
      { bp: 'px0561', value: '561px', class2Create: '.leadingZero{color:red;}' },
      { bp: 'px9000', value: '9000px', class2Create: '.tooLarge{color:red;}' },
      { bp: 'px641', value: '642px', class2Create: '.mismatch{color:red;}' },
    ]);
    expect(Array.from(style.sheet!.cssRules).every(rule => (rule as CSSMediaRule).conditionText.startsWith('only screen'))).toBeTrue();
  });
});
