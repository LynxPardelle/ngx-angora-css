# Ngx Angora CSS

Ngx Angora CSS is an Angular runtime CSS utility library. It scans rendered DOM classes, parses `ank-*` utility tokens, and inserts the generated CSS rules into managed stylesheets at runtime.

The goal is to ship a small JavaScript library instead of a large prebuilt utility stylesheet. Applications keep two stylesheet targets available, then the library creates only the rules that are actually used on the page.

## How It Works

1. Add the managed stylesheets to the Angular app.
2. Render classes that use the `ank` prefix.
3. Register optional runtime colors, breakpoints, aliases, and combos.
4. Call `cssCreate()` after Angular has rendered the view.
5. Inspect diagnostics when a class is skipped or malformed.

```html
<link rel="stylesheet" href="assets/css/angora-styles.css" />
<link rel="stylesheet" href="assets/css/angora-styles-responsive.css" />
```

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

## Class Shape

Most classes follow this shape:

```text
ank-property-value
```

Examples:

```html
<div class="ank-d-flex ank-gap-1rem ank-bg-white ank-c-black"></div>
<button class="ank-bgHover-primary ank-transformActive-scaleSD0_98ED"></button>
<section class="ank-gridTemplateColumns-md-repeatSD2COM__1frED"></section>
```

The parser supports:

- property aliases such as `ank-c-red` for `color`.
- encoded values for spaces, punctuation, selectors, and functions.
- pseudo states such as hover, focus, and active.
- responsive breakpoint tokens.
- selector targeting with `SEL__`.
- runtime combos for reusable class recipes.

## Runtime Extension API

`NgxAngoraService` exposes registry methods for extending the runtime:

```typescript
ank.runInCssCreateBatch(() => {
  ank.pushColors({ brandAurora: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)' });
  ank.pushBPS([{ bp: 'stage', value: '1080px', class2Create: '' }]);
  ank.pushAbreviationsValues({ pillRadius: '999px' });
  ank.pushAbreviationsClasses({ clusterGap: 'ank-gap' });
  ank.pushCombos({ Badge: ['ank-bg-brandAurora ank-c-white ank-rounded-pillRadius'] });
});
```

Use `runInCssCreateBatch()` when registering several runtime features during app startup. Registry methods that normally trigger CSS creation are deferred until the batch closes, so startup does one creation pass instead of one pass per registry call.

For manual control, the service also exposes `beginCssCreateBatch()` and `endCssCreateBatch()`. Always close a manual batch in `finally` if you use those lower-level methods.

## Performance And Duplicate Rules

`cssCreate()` is intended to run after Angular renders the view, after lazy content appears, or after a user action changes managed class names. Avoid unconditional `ngDoCheck` loops because they repeatedly scan the DOM.

Forced updates are idempotent: recreating an existing selector replaces the matching rule before inserting the new one. This applies to normal selectors and nested responsive selectors inside media rules.

## CSS Creation Debugging

The runtime records timing and run history for every completed `cssCreate()` call. Use these methods to build debug panels without relying on a DOM element such as `cssCreateMessage`:

```typescript
const lastRun = ank.getLastCssCreateReport();
const history = ank.getCssCreateHistory(8);
const summary = ank.getCssCreateDebugSummary();
const snapshot = ank.getCssCreateDebugSnapshot();

ank.clearCssCreateHistory();
```

For dynamic apps that need a fast explicit update after route changes or lazy rendering, the service also exposes DOM and readiness helpers:

```typescript
const renderedClasses = ank.collectRenderedDomClasses(document);
ank.cssCreate(renderedClasses);

const cssReady = await ank.waitForCssReady(1500);
const stylesheetAudit = ank.auditManagedStylesheets();
```

`collectRenderedDomClasses(root)` returns unique class tokens from the supplied DOM scope, `hasGeneratedCssRules()` reports whether managed stylesheets or creation history show generated rules, and `waitForCssReady(timeoutMs)` waits for CSS generation plus a paint frame before resolving.

`getCssCreateHistory(limit)` returns completed reports with `id`, `startedAt`, `completedAt`, `durationMs`, processed/created/skipped/failed counters, input classes, and diagnostics.

`getCssCreateDebugSummary()` aggregates total runs, total duration, average duration, fastest and slowest runs, created/skipped/failed totals, and warning/error diagnostic totals.

`getCssCreateDebugSnapshot()` combines the last report, recent history, summary, stylesheet availability/rule counts, and runtime registry counts for colors, breakpoints, combos, aliases, and created classes.

## Validation And Diagnostics

Use validation before creation when accepting user-entered or generated class names:

```typescript
const single = ank.validateClass('ank-color-red');
const batch = ank.validateClasses(['ank-color-red', 'ank-color-md-red', 'ank-']);
```

After `cssCreate()`, inspect the last creation report:

```typescript
const report = ank.getLastCssCreateReport();
ank.clearCssCreateReport();
```

The report includes processed, created, skipped, and failed counters plus diagnostics such as `invalid-class-structure`, `invalid-class-discovered`, `invalid-rule-fragment`, and `stylesheet-missing`.

## AI Notes

AI agents working with this repository should start with [`AGENTS.md`](AGENTS.md) and [`docs/ai/ngx-angora-css-ai-notes.md`](docs/ai/ngx-angora-css-ai-notes.md).

Local Codex skills and agent prompts live under `.codex/skills/` and `.codex/agents/`. They cover app integration, class authoring, runtime batching, debugging, duplicate-rule checks, and release work.

## Demo App

Run the tutorial/demo app:

```bash
npm start
```

The app imports the library source directly from `projects/ngx-angora-css-library/src/public-api`, so it is the fastest place to validate class parsing, combo expansion, stylesheet insertion, validation, diagnostics, and responsive rule creation together.

## Testing

Run the library and app tests independently or together:

```bash
npm run test:library
npm run test:app
npm run test:all
```

Run a production build:

```bash
npm run build
```

## Author

Lynx Pardelle

## Support

[Buy Me a Coffee](https://www.buymeacoffee.com/lynxpardelle)
