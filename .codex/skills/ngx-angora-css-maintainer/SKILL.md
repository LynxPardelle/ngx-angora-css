---
name: ngx-angora-css-maintainer
description: Use when modifying, debugging, testing, or publishing the Ngx Angora CSS Angular library itself, especially cssCreate generation, diagnostics, duplicate CSS rules, batching, packaging, and npm release work.
---

# Ngx Angora CSS Maintainer

Use this skill when changing the library implementation, the tutorial app, diagnostics, packaging, or release workflow.

## Workflow

1. Inspect the existing tests around the behavior before editing parser, CSSOM insertion, diagnostics, or batching code.
2. Add or update focused tests for regressions in `cssCreate()`, validation, duplicate rule insertion, batching, and debug reports.
3. Keep rule insertion idempotent for normal selectors and responsive media rules.
4. Preserve public diagnostics APIs: `getCssCreateHistory()`, `getCssCreateDebugSummary()`, `getCssCreateDebugSnapshot()`, and `clearCssCreateHistory()`.
5. Preserve the tutorial as a working Angular guide, including the Buy Me a Coffee widget.
6. Run the relevant library/app tests, build, and production audit.
7. For releases, build the library and publish from `dist/ngx-angora-css-library`.

## Hard Rules

- Do not change package metadata, version, or publish tags without an explicit release reason.
- Do not remove idempotent duplicate-rule handling.
- Do not bypass npm 2FA or report a publish as complete unless npm returns success.
- Do not rely on stale audit results for release decisions; run the audit command again.

## Reference

Read `references/maintenance-checklist.md` for commands and release checks.

