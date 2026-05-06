---
name: ngx-angora-css-usage
description: Use when building or reviewing Angular UI that uses Ngx Angora CSS runtime utility classes, including setup, class authoring, runtime tokens, combos, validation, and cssCreate debugging.
---

# Ngx Angora CSS Usage

Use this skill when integrating `ngx-angora-css` into an Angular app or reviewing UI code that uses `ank-*` classes.

## Workflow

1. Confirm the app includes `assets/css/angora-styles.css` and `assets/css/angora-styles-responsive.css`.
2. Inject `NgxAngoraService` and call `cssCreate()` after Angular renders, usually with `afterNextRender()`.
3. Author classes with the `ank-property-value` shape and validate non-trivial classes with `validateClass()` or `validateClasses()`.
4. Register runtime colors, breakpoints, value aliases, class aliases, CSS names, or combos through public service APIs.
5. Wrap related startup registrations in `runInCssCreateBatch()` so they produce one creation pass.
6. Use `getCssCreateHistory()`, `getCssCreateDebugSummary()`, and `getCssCreateDebugSnapshot()` when debugging timing, skipped classes, failed classes, or duplicate rules.
7. Run the relevant tests and inspect the browser when UI output changes.

## Hard Rules

- Do not call `cssCreate()` from unconditional `ngDoCheck` loops or render polling.
- Do not remove the Buy Me a Coffee widget from the tutorial shell.
- Do not mutate service singleton internals when public methods exist.
- Do not guess token encodings; use `befysize()`, `unbefysize()`, validation APIs, or the local reference notes.

## Reference

Read `references/usage-patterns.md` for examples, token encodings, and review checklists.

