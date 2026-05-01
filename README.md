# NgxAngoraCss

## 🧐 About

NgxAngoraCss is a css framework made in js that creates all the css styles from your classes dynamically in the load of your pages, that mean that your users will only need to download the js and not a css file of 50mb+ and speed up you charge with a simple task that only consumes a few memory of the ram of the user.

## 🏁 Getting Started

You can check the full tutorial in the [Angora CSS guide](https://lynx-bef.vercel.app/), but you will need to change the class prefix and stylesheet names to the current Angular library values. For example, use `ank` instead of `bef` and `angora-styles.css` instead of the previous stylesheet name.

We will have a special page for the documentation of the library and the new classes that are on the library soon.

## 🧪 Testing

The workspace now exposes explicit scripts for both the demo app and the library:

```bash
npm run test:library
npm run test:app
npm run test:all
```

Use the app to validate the library in a real Angular render flow:

```bash
npm run start-test-library
```

The demo app imports the library source directly from `projects/ngx-angora-css-library/src/public-api`, so it is the fastest way to verify class parsing, combo creation, and stylesheet rule insertion together.

## 🔎 Diagnostics

The library now stores a CSS creation report for the last run. You can inspect it from `NgxAngoraService`:

```typescript
const report = ankService.getLastCssCreateReport();
ankService.clearCssCreateReport();
```

The report includes:

- Processed, created, skipped, and failed class counters.
- The last successful and failed class names.
- Structured diagnostics with codes such as `invalid-class-structure`, `invalid-class-discovered`, `invalid-rule-fragment`, and `stylesheet-missing`.

This makes it easier to understand why a class was skipped without stopping the whole CSS creation flow.

## ✅ Validation

You can also preflight classes before calling `cssCreate()`:

```typescript
const single = ankService.validateClass('ank-color-red');
const batch = ankService.validateClasses(['ank-color-red', 'ank-color-md-red', 'ank-']);
```

Each validation result tells you whether the class is `valid`, `invalid`, or `duplicate`, includes any diagnostics, and returns the generated rule preview when the class can be created.

The demo app now includes a live report panel for the last `cssCreate()` run and a validation panel for quick manual checks while you test the library with Angular.

## ✍️ Authors

Lynx Pardelle

## Support this library

[Buy Me a Coffe](https://www.buymeacoffee.com/lynxpardelle)
