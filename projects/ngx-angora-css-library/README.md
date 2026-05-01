# Ngx Angora CSS

Ngx Angora CSS is an Angular runtime CSS utility library. It scans rendered DOM classes, parses `ank-*` utility tokens, and inserts the generated CSS rules into managed stylesheets at runtime.

## Required Stylesheets

The runtime needs two linked stylesheets so it can insert normal and responsive rules:

```html
<link rel="stylesheet" href="assets/css/angora-styles.css" />
<link rel="stylesheet" href="assets/css/angora-styles-responsive.css" />
```

The default stylesheet names are configured in `ValuesSingleton` as `angora-styles.css` and `angora-styles-responsive.css`.

## Basic Usage

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

## Runtime Extension API

```typescript
ank.runInCssCreateBatch(() => {
  ank.pushColors({ brandAurora: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)' });
  ank.pushBPS([{ bp: 'stage', value: '1080px', class2Create: '' }]);
  ank.pushAbreviationsValues({ pillRadius: '999px' });
  ank.pushAbreviationsClasses({ clusterGap: 'ank-gap' });
  ank.pushCombos({ Badge: ['ank-bg-brandAurora ank-c-white ank-rounded-pillRadius'] });
});
```

Batch runtime registration when several registries are updated together. Calls to `cssCreate()` requested by registry helpers are deferred until the batch closes, which keeps startup to one creation pass.

The lower-level `beginCssCreateBatch()` and `endCssCreateBatch()` methods are available for advanced flows. If you use them directly, close the batch from a `finally` block.

## Performance And Duplicate Rules

Run `cssCreate()` after render, after lazy content appears, or after a user action changes managed class names. Avoid unconditional `ngDoCheck` loops.

Forced recreation is idempotent: existing matching selectors are replaced before new rules are inserted, including nested rules in the responsive stylesheet.

## CSS Creation Debugging

```typescript
const lastRun = ank.getLastCssCreateReport();
const history = ank.getCssCreateHistory(8);
const summary = ank.getCssCreateDebugSummary();
const snapshot = ank.getCssCreateDebugSnapshot();

ank.clearCssCreateHistory();
```

Every completed `cssCreate()` report includes `id`, `startedAt`, `completedAt`, `durationMs`, counters, input classes, and diagnostics. The summary method aggregates timing and class counters across the stored history. The snapshot method adds stylesheet availability/rule counts and runtime registry sizes.

## Validation And Diagnostics

```typescript
const validation = ank.validateClass('ank-color-red');
const report = ank.validateClasses(['ank-color-red', 'ank-color-md-red', 'ank-']);
```

```typescript
const creationReport = ank.getLastCssCreateReport();
ank.clearCssCreateReport();
```

Validation results include `valid`, `invalid`, or `duplicate` status, a generated rule preview when available, and diagnostics that explain malformed classes.

Creation reports include processed, created, skipped, and failed counters plus diagnostics such as `invalid-class-structure`, `invalid-class-discovered`, `invalid-rule-fragment`, and `stylesheet-missing`.

## Testing

From the workspace root:

```bash
npm run test:library
npm run test:app
npm run test:all
npm run build
```

The demo app imports the library source directly, so it exercises real class discovery, combo parsing, validation, diagnostics, and stylesheet insertion.

## Author

Lynx Pardelle
