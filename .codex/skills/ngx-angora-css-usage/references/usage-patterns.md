# Ngx Angora CSS Usage Patterns

## Setup

```html
<link rel="stylesheet" href="assets/css/angora-styles.css" />
<link rel="stylesheet" href="assets/css/angora-styles-responsive.css" />
```

```typescript
import { afterNextRender, Component } from '@angular/core';
import { NgxAngoraService } from 'ngx-angora-css';

@Component({
  selector: 'app-demo',
  template: `<button class="ank-bg-primary ank-c-white ank-p-0_75rem__1rem">Save</button>`,
})
export class DemoComponent {
  constructor(private readonly ank: NgxAngoraService) {
    afterNextRender(() => this.ank.cssCreate());
  }
}
```

## Runtime Registration

```typescript
ank.runInCssCreateBatch(() => {
  ank.pushColors({ brandAurora: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)' });
  ank.pushBPS([{ bp: 'stage', value: '1080px', class2Create: '' }]);
  ank.pushAbreviationsValues({ pillRadius: '999px' });
  ank.pushAbreviationsClasses({ clusterGap: 'ank-gap' });
  ank.pushCombos({ Badge: ['ank-bg-brandAurora ank-c-white ank-rounded-pillRadius'] });
});
```

## Class Examples

```html
<div class="ank-d-flex ank-gap-1rem ank-bg-white ank-c-black"></div>
<button class="ank-bgHover-primary ank-transformActive-scaleSD0_98ED"></button>
<section class="ank-gridTemplateColumns-md-repeatSD2COM__1frED"></section>
```

## Encoding

Encoding is defined in `ValuesSingleton.abreviationTraductors`.

Common tokens:

- `per` means `%` when attached to a number.
- `COM` means comma.
- `MIN` means hyphen.
- `PLUS` means plus.
- `SD` and `ED` mean parentheses.
- `SE` and `EE` mean square brackets.
- `HASH` means `#`.
- `SLASH` means `/`.
- `UND` means underscore.
- `__` means space.
- `_` means decimal point.
- `CHILD`, `ADJ`, and `SIBL` encode selector combinators.
- `DPS` means colon.
- `PNC` means semicolon.

Prefer `ank.befysize(value)` and `ank.unbefysize(value)` for generated values.

## Debugging

```typescript
const validation = ank.validateClass('ank-color-red');
const batchValidation = ank.validateClasses(['ank-color-red', 'ank-']);

const lastRun = ank.getLastCssCreateReport();
const history = ank.getCssCreateHistory(10);
const summary = ank.getCssCreateDebugSummary();
const snapshot = ank.getCssCreateDebugSnapshot(10);
```

Use `history[].durationMs`, `history[].diagnostics`, `summary.totalFailedClasses`, and `snapshot.stylesheets` before changing parser or stylesheet code.

## Browser Review

For tutorial or app changes:

- verify the page renders at `http://127.0.0.1:4200/` when the dev server is running.
- click any available `cssCreate()` demo controls repeatedly.
- inspect managed stylesheets for duplicate selectors and duplicate media queries.
- confirm the Buy Me a Coffee widget is visible.

