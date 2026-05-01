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
ank.pushColors({ brandAurora: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)' });
ank.pushBPS([{ bp: 'stage', value: '1080px', class2Create: '' }]);
ank.pushAbreviationsValues({ pillRadius: '999px' });
ank.pushAbreviationsClasses({ clusterGap: 'ank-gap' });
ank.pushCombos({ Badge: ['ank-bg-brandAurora ank-c-white ank-rounded-pillRadius'] });
```

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
