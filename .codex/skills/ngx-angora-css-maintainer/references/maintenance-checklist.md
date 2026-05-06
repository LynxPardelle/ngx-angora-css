# Ngx Angora CSS Maintenance Checklist

## Test And Build

```bash
npm run test:library
npm run test:app
npm run build
npm audit --omit=dev
```

Prefer the focused test scripts over `npm run test:all` when diagnosing Karma issues, because the combined command can obscure which suite left a runner open.

## Stuck Karma Cleanup

Only stop processes after confirming the command line belongs to this repo or the active test run:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match 'karma|ChromeHeadless|ng test ngx-angora-css' } |
  Select-Object ProcessId,Name,CommandLine
```

Then stop only confirmed PIDs:

```powershell
Stop-Process -Id <PID>
```

## CSS Creation Risks

When changing CSS generation:

- keep `cssCreate()` reports populated with timing, counters, input classes, and diagnostics.
- keep duplicate insertion idempotent for simple rules and media rules.
- keep registry batching behavior covered by tests.
- verify malformed classes produce diagnostics instead of silent failures.
- inspect the browser after repeated create actions for duplicate selectors.

## Release Flow

```bash
npm audit --omit=dev
npm run test:library
npm run test:app
npx ng build ngx-angora-css-library
cd dist/ngx-angora-css-library
npm publish --dry-run --json
npm publish --access public --tag latest --json
```

The package name is `ngx-angora-css`. npm may require an OTP for real publish. If `npm publish` returns an error, report the exact npm error and do not mark the release complete.

## Documentation

When changing behavior, update at least one of:

- root `README.md`.
- package README under `projects/ngx-angora-css-library/README.md`.
- tutorial app content.
- AI notes under `docs/ai/`.

