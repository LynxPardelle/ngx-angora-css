# AI Notes for Ngx Angora CSS

These notes are for AI coding agents working in this repository.

## Purpose

`ngx-angora-css` is an Angular runtime CSS utility library. It scans rendered DOM class names that start with `ank`, parses those utility tokens, and writes only the generated CSS rules that the app actually uses into managed stylesheets.

The demo app is also the project tutorial. Keep it useful as a working Angular-first guide, not only as a marketing page.

## Non-Negotiables

- Preserve the external Buy Me a Coffee widget in `src/index.html`; it is intentional project UI.
- Do not add unconditional `cssCreate()` calls in `ngDoCheck`, polling loops, or repeated render paths.
- Use `runInCssCreateBatch()` when registering multiple runtime colors, breakpoints, aliases, CSS names, or combos.
- Prefer public service APIs over direct mutation of singleton internals.
- Validate generated or user-authored class names with `validateClass()` or `validateClasses()` before treating them as correct.

## Angular Setup

Apps using the library need the managed stylesheet targets:

```html
<link rel="stylesheet" href="assets/css/angora-styles.css" />
<link rel="stylesheet" href="assets/css/angora-styles-responsive.css" />
```

Call `cssCreate()` after Angular renders the classes:

```typescript
import { afterNextRender, Component } from '@angular/core';
import { NgxAngoraService } from 'ngx-angora-css';

@Component({
  selector: 'app-root',
  template: `<button class="ank-bg-primary ank-c-white ank-p-0_75rem__1rem">Save</button>`,
})
export class AppComponent {
  constructor(private readonly ank: NgxAngoraService) {
    afterNextRender(() => this.ank.cssCreate());
  }
}
```

## Class Authoring

Most utilities follow:

```text
ank-property-value
```

Common examples:

```html
<div class="ank-d-flex ank-gap-1rem ank-bg-white ank-c-black"></div>
<button class="ank-bgHover-primary ank-transformActive-scaleSD0_98ED"></button>
<section class="ank-gridTemplateColumns-md-repeatSD2COM__1frED"></section>
```

Encoding tokens come from `ValuesSingleton.abreviationTraductors`. Common ones include `MIN` for `-`, `PLUS` for `+`, `SD` and `ED` for parentheses, `COM` for comma, `__` for spaces, `_` for decimal points, `HASH` for `#`, `SLASH` for `/`, `DPS` for `:`, and `PNC` for `;`.

Use `ank.befysize(value)` and `ank.unbefysize(value)` when code needs to encode or decode a value instead of hand-building complex tokens.

## Runtime Registration

Register groups of runtime extensions in one batch:

```typescript
ank.runInCssCreateBatch(() => {
  ank.pushColors({ brandAurora: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)' });
  ank.pushBPS([{ bp: 'stage', value: '1080px', class2Create: '' }]);
  ank.pushAbreviationsValues({ pillRadius: '999px' });
  ank.pushAbreviationsClasses({ clusterGap: 'ank-gap' });
  ank.pushCombos({ Badge: ['ank-bg-brandAurora ank-c-white ank-rounded-pillRadius'] });
});
```

Manual batches are available through `beginCssCreateBatch()` and `endCssCreateBatch()`, but close them in `finally` if you use them.

## Debugging

Use the public diagnostics APIs rather than the old `cssCreateMessage` DOM hook:

```typescript
const lastRun = ank.getLastCssCreateReport();
const history = ank.getCssCreateHistory(8);
const summary = ank.getCssCreateDebugSummary();
const snapshot = ank.getCssCreateDebugSnapshot();

ank.clearCssCreateHistory();
```

When debugging repeated styles, inspect the history counters, generated selectors, managed stylesheet rule counts, and duplicate selectors/media queries in the browser.

## Verification

Useful commands:

```bash
npm run test:library
npm run test:app
npm run build
npm audit --omit=dev
```

For package work:

```bash
npx ng build ngx-angora-css-library
cd dist/ngx-angora-css-library
npm publish --dry-run --json
```

Publish from `dist/ngx-angora-css-library`. The package name is `ngx-angora-css`.

