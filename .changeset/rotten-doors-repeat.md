---
'@still-void/ui': patch
---

Fix the types shipped to CommonJS consumers. Every export subpath advertised a single
`types` entry pointing at the ESM `.d.ts`, so anything using `require('@still-void/ui')`
resolved ESM type declarations against a CommonJS runtime file (attw: "Masquerading as
ESM"), and `@still-void/ui/react` / `@still-void/ui/react/client` resolved to nothing at
all under the legacy `node10` module resolution. `exports` now carries per-condition
`types` (`.d.ts` for `import`, the already-built `.d.cts` for `require`), plus
`typesVersions` for `node10` consumers and a `./package.json` export.
