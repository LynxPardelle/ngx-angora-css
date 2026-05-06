# Ngx Angora CSS AI Usage Notes

Use this guide when an AI agent needs to integrate, debug, or document `ngx-angora-css`.

## What This Library Does

`ngx-angora-css` is an Angular runtime CSS utility library. It does not ship one large static utility stylesheet. Instead, Angular renders `ank-*` classes, the service scans those classes, parses each token, and inserts the needed CSS rules into two managed stylesheets.

The main user-facing mental model is:

1. Provide the two stylesheet targets.
2. Render `ank-*` classes in Angular templates.
3. Register optional runtime tokens and combos.
4. Call `cssCreate()` after render.
5. Use the debug APIs to inspect timing, skipped classes, and failed rules.

## Minimal Angular Integration

```html
<link rel="stylesheet" href="assets/css/angora-styles.css" />
<link rel="stylesheet" href="assets/css/angora-styles-responsive.css" />
```

```typescript
import { afterNextRender, Component } from '@angular/core';
import { NgxAngoraService } from 'ngx-angora-css';

@Component({
  selector: 'app-root',
  template: `
    <main class="ank-d-grid ank-gap-1rem ank-p-1rem">
      <button class="ank-bg-primary ank-c-white ank-p-0_75rem__1rem">
        Save
      </button>
    </main>
  `,
})
export class AppComponent {
  constructor(private readonly ank: NgxAngoraService) {
    afterNextRender(() => this.ank.cssCreate());
  }
}
```

Call `cssCreate()` again only when new managed classes appear after lazy rendering, route changes, or user interaction.

## Runtime Tokens

Use the public registration APIs:

```typescript
ank.runInCssCreateBatch(() => {
  ank.pushColors({
    brandAurora: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)',
    inkStrong: '#111827',
  });

  ank.pushBPS([
    { bp: 'stage', value: '1080px', class2Create: '' },
  ]);

  ank.pushAbreviationsValues({
    pillRadius: '999px',
  });

  ank.pushAbreviationsClasses({
    clusterGap: 'ank-gap',
  });

  ank.pushCombos({
    Badge: ['ank-bg-brandAurora ank-c-white ank-rounded-pillRadius'],
  });
});
```

Batch registration prevents one startup scan per registry method.

## Class Patterns

Use the normal utility shape:

```text
ank-property-value
```

Examples:

```html
<div class="ank-d-flex ank-gap-1rem ank-bg-white ank-c-black"></div>
<button class="ank-bgHover-primary ank-transformActive-scaleSD0_98ED"></button>
<section class="ank-gridTemplateColumns-md-repeatSD2COM__1frED"></section>
```

Common value encodings:

| Token | Meaning |
| --- | --- |
| `per` | `%` when attached to a number, for example `100per` |
| `COM` | comma |
| `CSP` | single quote |
| `CDB` | double quote |
| `MIN` | hyphen |
| `PLUS` | plus |
| `SD` | `(` |
| `ED` | `)` |
| `SE` | `[` |
| `EE` | `]` |
| `HASH` | `#` |
| `SLASH` | `/` |
| `UND` | underscore |
| `__` | space |
| `_` | decimal point |
| `CHILD` | child combinator, `>` |
| `ADJ` | adjacent sibling combinator, `+` |
| `SIBL` | general sibling combinator, `~` |
| `ALL` | universal selector, `*` |
| `EQ` | equals |
| `ST` | caret |
| `INC` | dollar sign |
| `DPS` | colon |
| `PNC` | semicolon |

When generating complex values programmatically, prefer:

```typescript
const encoded = ank.befysize('repeat(2, 1fr)');
const decoded = ank.unbefysize(encoded);
```

## Debugging Workflow

Start with validation:

```typescript
const one = ank.validateClass('ank-color-red');
const many = ank.validateClasses(['ank-color-red', 'ank-color-md-red', 'ank-']);
```

After CSS creation, inspect runtime state:

```typescript
const report = ank.getLastCssCreateReport();
const history = ank.getCssCreateHistory(12);
const summary = ank.getCssCreateDebugSummary();
const snapshot = ank.getCssCreateDebugSnapshot(12);
```

Use `summary.averageDurationMs`, `summary.slowestDurationMs`, `history[].durationMs`, `history[].diagnostics`, and `snapshot.stylesheets` to identify slow scans, missing stylesheet targets, malformed classes, and repeated rules.

To reset only the debug history:

```typescript
ank.clearCssCreateHistory();
```

For route changes, lazy components, and static CSS generation tools, prefer the library helpers before adding app-local DOM scanners:

```typescript
const renderedClasses = ank.collectRenderedDomClasses(document);
ank.cssCreate(renderedClasses);
await ank.waitForCssReady(1500);
const audit = ank.auditManagedStylesheets();
```

These helpers centralize rendered class collection, generated-rule readiness checks, duplicate-rule audits, and the paint-frame wait that consumers commonly need before hiding loaders or collecting static CSS.

## Good Patterns

- Add stylesheet targets before expecting runtime rules.
- Use `afterNextRender()` for first creation in Angular components.
- Batch startup extension registration with `runInCssCreateBatch()`.
- Validate generated classes before showing them in docs or examples.
- Build tutorial examples that show the rendered class, generated effect, and debug output together.
- Preserve `src/index.html` external support widgets unless the user explicitly asks to remove them.

## Avoid

- Calling `cssCreate()` in every change detection cycle.
- Directly editing singleton state when a public service method exists.
- Registering several runtime features separately during startup.
- Assuming a class is valid because it looks like a Tailwind or Bootstrap utility.
- Reporting duplicate CSS fixes without browser-checking the managed stylesheets.

## Finish Checklist

Before handing off a change that affects the library or tutorial:

```bash
npm run test:library
npm run test:app
npm run build
npm audit --omit=dev
```

For UI/tutorial changes, also inspect the app in the browser and check:

- no console errors.
- the Buy Me a Coffee widget is still present.
- no horizontal overflow on mobile.
- repeated `cssCreate()` actions do not duplicate managed selectors or media queries.
