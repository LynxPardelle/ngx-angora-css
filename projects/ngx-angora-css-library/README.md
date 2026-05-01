# NgxAngoraCss

## 🧐 About

NgxAngoraCss is a css framework made in js that creates all the css styles from your classes dynamically in the load of your pages, that mean that your users will only need to download the js and not a css file of 50mb+ and speed up you charge with a simple task that only consumes a few memory of the ram of the user.

## 🏁 Getting Started

You can check the full tutorial in the [Angora CSS guide](https://lynx-bef.vercel.app/), but you will need to change the class prefix and stylesheet names to the current Angular library values. For example, use `ank` instead of `bef` and `angora-styles.css` instead of the previous stylesheet name.

We will have a special page for the documentation of the library and the new classes that are on the library soon.

## 🧪 Testing

From the workspace root you can run the library and the demo app independently:

```bash
npm run test:library
npm run test:app
npm run test:all
```

If you want to validate the library while rendering the Angular demo app, use:

```bash
npm run start-test-library
```

The demo app imports the library source directly, so it exercises real class discovery, combo parsing, and stylesheet insertion.

## 🔎 Diagnostics

`NgxAngoraService` now exposes the last CSS creation report:

```typescript
const report = ankService.getLastCssCreateReport();
ankService.clearCssCreateReport();
```

The report contains:

- `processedClasses`, `createdClasses`, `skippedClasses`, and `failedClasses`.
- `lastSuccessfulClassName` and `lastFailedClassName`.
- A `diagnostics` array with stage, code, message, optional class name, and suggested fix.

This is useful when a malformed class should be skipped instead of breaking the full CSS creation run.

## ✅ Validation

`NgxAngoraService` now exposes preflight validation helpers:

```typescript
const validation = ankService.validateClass('ank-color-red');
const report = ankService.validateClasses(['ank-color-red', 'ank-color-md-red', 'ank-']);
```

Validation results include:

- `status`: `valid`, `invalid`, or `duplicate`.
- `generatedRule`: the CSS preview that would be created for valid classes.
- `diagnostics`: the warnings that explain why a class is invalid.

Use `{ checkDuplicates: true }` when you want validation to tell you that a class is already present in the managed stylesheet or already tracked in memory.

## 🛠 Troubleshooting

Common diagnostics and what they usually mean:

- `invalid-class-discovered`: a class starting with `ank` was found in the DOM without a property token, for example `ank-`.
- `invalid-class-structure`: the parser received a malformed class and skipped it before trying to build CSS.
- `missing-property-token`: the parser or property joiner could not resolve the CSS property to generate.
- `invalid-rule-fragment` or `invalid-css-rule-shape`: the class could be parsed partially, but it did not produce a valid CSS block.
- `stylesheet-missing`: the target stylesheet was not available when CSS creation started.

Recommended troubleshooting flow:

1. Call `getLastCssCreateReport()` after `cssCreate()`.
2. Check `diagnostics` for the first warning or error.
3. Fix malformed class names before retrying.
4. Ensure both managed stylesheets are available before automatic CSS generation starts.

## ✍️ Authors

Lynx Pardelle

## Support this library

[Buy Me a Coffe](https://www.buymeacoffee.com/lynxpardelle)
