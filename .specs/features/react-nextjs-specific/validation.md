# Validation — React/Next.js-Specific Design System

**Verdict: PASS**

## Per-AC evidence

| Req ID | AC | Evidence |
| --- | --- | --- |
| RNS-01 | tokens/types/recipes exported from `@still-void/ui/react` | `src/react/index.ts` re-exports all 6 token modules + 4 recipe modules + types; `attw`/`publint` green |
| RNS-02 | client behaviors exported from `@still-void/ui/react/client` | `src/react/client/index.ts` re-exports themeManager/scrollSpy/readingProgress/clipboard |
| RNS-03 | bare `@still-void/ui` import fails | `src/index.ts` deleted, `exports["."]`/`main`/`module`/top-level `types` removed from package.json — confirmed no `.` key remains |
| RNS-04 | `publint --strict` + `attw` pass on `./react`, `./react/client`, css, package.json entries | `npm run lint:package` → all 🟢, "All good!" |
| RNS-05 | no token/class value drift | tokens/recipes files untouched, only re-export paths added; `npm test` 171/171 pass (includes `tokenParity.test.ts`, `contrast.test.ts`, `recipes.test.ts`) |
| RNS-06 | theme.css/style.css byte-identical | `scripts/copy-css.mjs` unchanged, still copies `src/css/*.css` verbatim |
| RNS-07/08 | design system doc covers architecture/tokens/catalog, flags client-only components | `docs/design-system.md` written, includes server/client table split per component |
| RNS-09/10/11 | migration guide: full old→new map, no-code-change-to-tokens path, explicit no-path for non-React | `docs/migration-v1-to-v2.md` — full table, "What did not change" section, "If you can't migrate yet" section |
| RNS-12 | major changeset | `.changeset/react-nextjs-only.md`, `"@still-void/ui": major` |

## Discrimination check (manual, no formal mutation harness in this repo)

- Deleting `src/index.ts` without the parity re-exports would have broken `npm run typecheck` (verified: initial run caught the `ReadingProgress` name collision — TS2308 — proving the type-check step actually exercises the new export surface, not a false-green).
- Removing `exports["."]` was confirmed by `publint`/`attw` re-run showing only `./react`, `./react/client`, `./package.json` — no leftover `.` entry.

## Gaps

None blocking. Noted for follow-up (out of this feature's scope, not spec violations):
- No automated CSS byte-diff script exists (RNS-06 verified by unchanged copy logic + passing visual-token tests, not an explicit before/after diff artifact).
- No consumer smoke-test app was created to physically exercise `npm install` against the packed tarball in a Next.js app (Independent Test for P1 story #1 was validated via `publint --pack`/`attw --pack`, which packs and inspects the real tarball, not a full Next.js render).

## Commands run

```
npm run typecheck   # pass
npm run build       # pass
npm run lint:package # pass (publint --strict + attw)
npm test            # 171/171 pass
```

## Diff range

`812fb32..HEAD` on `feature/react-nextjs-specific` (branched from `feature/shadcn-theme-integration`).
