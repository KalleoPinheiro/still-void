# Contributing to `@still-void/ui`

Read [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md) before touching components or
visual decisions. In one line: **port, don't redesign**.

## Local setup

```sh
npm ci
npm run build        # tsup (ESM + CJS + .d.ts) + CSS into dist/
npm test             # vitest
npm run typecheck    # tsc --noEmit (strict)
npm run lint:package # publint + are-the-types-wrong on the packed tarball
npm run storybook    # component catalog at localhost:6006
```

Node **22+** is required for development (`.nvmrc`). The published package still supports
Node ≥ 18 — the stricter floor comes from vitest 4/rolldown, not from the library.

## Every source change needs a changeset

CI fails a pull request that touches `src/` or `scripts/` without a changeset:

```sh
npm run changeset      # pick the bump level, describe the change
git add .changeset
```

Write the description for a **consumer** of the design system, not for the person who
wrote the diff: what changed in the tokens, classes, components or types, and what the
consumer has to do about it. The description lands verbatim in `CHANGELOG.md`.

Never edit `version` in `package.json` or write in `CHANGELOG.md` by hand — both are
generated from changesets.

If a change genuinely cannot affect consumers (a comment, a test, a workflow), add the
`no-changeset` label to the pull request.

## Choosing the bump level

The public surface of this package is larger than its TypeScript exports:

1. The export subpaths: `.`, `./react`, `./react/client`, `./theme.css`, `./style.css`
2. The `sv-*` class names emitted by the recipes in `src/recipes/`
3. The `--sv-*` CSS custom properties in `src/css/theme.css`
4. The `data-theme` / `data-accent` attribute contract
5. The generated `.d.ts` / `.d.cts` types
6. `engines.node` and the `peerDependencies` ranges

| Bump | When |
| --- | --- |
| **patch** | Bug, a11y or contrast fix; CSS correction that changes no class name or variable; docs; performance; type fix that breaks no consumer. |
| **minor** | New component, recipe or behavior; new token or `--sv-*` variable; new optional prop; new export subpath; new accent. |
| **major** | Removing or renaming an export, recipe, `sv-*` class or `--sv-*` variable; changing a subpath; a token value change that visibly alters the design; raising `engines.node` or a peer range. |

The rule that follows from *port, don't redesign*: a token value **corrected to match the
spec** is a `patch` (it is a bug fix), while a token value **changed by aesthetic choice**
is a `major`. `tests/tokenParity.test.ts` guards that boundary and runs in CI.

## Release flow

Everything is automated — nobody publishes from a laptop.

1. Merge a pull request into `main` carrying one or more changesets.
2. `.github/workflows/release.yml` runs typecheck, tests, build and `lint:package`, then
   opens (or updates) a **`chore: version packages`** pull request containing the version
   bump, the regenerated `CHANGELOG.md` and the refreshed `package-lock.json`.
3. Review that pull request — it is the last chance to read the changelog before it is
   public.
4. Merge it. The same workflow then publishes to npm with
   [provenance](https://docs.npmjs.com/generating-provenance-statements), pushes the
   `v<version>` tag, creates the GitHub release and redeploys Storybook to GitHub Pages.

Running `npm run version-packages` locally needs a `GITHUB_TOKEN` in the environment (the
changelog generator links pull requests and authors). In normal use, let CI do it.

## Testing a change before it ships (canary)

To install an unreleased change in a real application, publish a snapshot:

- add the **`canary`** label to the pull request, or
- run the **Snapshot release** workflow manually from the Actions tab.

It publishes `0.0.0-canary-<timestamp>` under the `canary` dist-tag and comments the exact
install command on the pull request. Snapshots are never promoted to `latest`.

## Repository configuration (one-time)

The automation depends on:

| What | Where |
| --- | --- |
| `NPM_TOKEN` secret — npm granular access token, **Read and write** on `@still-void/ui`, with **Bypass 2FA** enabled | Settings → Secrets and variables → Actions |
| *Allow GitHub Actions to create and approve pull requests* | Settings → Actions → General → Workflow permissions |
| Pages source: **GitHub Actions** | Settings → Pages |

npm retired classic tokens (including the old "Automation" type) in December 2025 — every
publish token is now a granular access token, capped at a 90-day lifetime, so `NPM_TOKEN`
needs rotating before it expires. See [RELEASE_SETUP_TODO.md](RELEASE_SETUP_TODO.md) for
the exact steps, including the OIDC trusted-publishing alternative npm now recommends.
