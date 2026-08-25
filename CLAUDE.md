# Still Void UI

`@still-void/ui` — a React/Next.js-first design system, ported literally from the `blog.kalleopinheiro.dev` "Still Void" prototype. Built on shadcn/ui, it splits into a server-safe entry (`@still-void/ui/react`, no hooks, renders in Next.js Server Components) and a `'use client'` entry (`@still-void/ui/react/client`). The package was framework-agnostic through `1.x`; the `2.0` breaking change (see [docs/migration-v1-to-v2.md](docs/migration-v1-to-v2.md)) removed the bare framework-agnostic core entry point in favor of this React/Next.js-only positioning — tokens and recipes still stay plain TypeScript/CSS underneath the React layer, but there is no public non-React entry point anymore.

## Design Context

- [PRODUCT.md](PRODUCT.md) — register (product), users (dev consumers of the library), positioning (React/Next.js-first + RSC-safe), anti-references, design principles.
- [DESIGN.md](DESIGN.md) — visual system: dark-first near-black palette, one switchable accent (`data-accent`), Sora/Manrope/JetBrains Mono, zero shadows, `.sv-gradient-border` as the one deliberate signature flourish.

Read both before making component or visual decisions. In one line: **port, don't redesign** — every token value is literal from the spec; approximating a color "for elegance" is a regression.

## Release

Versioning and publishing are automated with Changesets + GitHub Actions — see [CONTRIBUTING.md](CONTRIBUTING.md) for the full flow. The rules that bind every change:

- **Every change under `src/` or `scripts/` needs a changeset** (`npm run changeset`). CI fails the PR otherwise. Write the description for a consumer of the library — it ships verbatim in the changelog.
- **Never hand-edit `version` in `package.json` or `CHANGELOG.md`.** Both are generated; `npm run version-packages` and the release workflow own them.
- **Bump levels:** patch = bug/a11y/CSS fix with no rename; minor = new component, recipe, token, prop or export; major = removing or renaming an export, an `sv-*` class or a `--sv-*` variable, or raising `engines.node`/peer ranges. A token value **corrected against the spec is a patch**; a token value **changed by aesthetic choice is a major** — that is the versioning form of *port, don't redesign*.
- **The `exports` map is public API.** Its five subpaths, plus the `sv-*` classes and `--sv-*` variables, are what consumers depend on. `npm run lint:package` (publint + are-the-types-wrong) runs in CI and must stay green.

<!-- ai-memory:start -->
## Long-term memory (ai-memory)

This project uses [ai-memory](https://github.com/akitaonrails/ai-memory)
for cross-session continuity.

**Default to the current project - always.** Every ai-memory tool
auto-scopes to the project resolved from your session's working
directory. **Do NOT pass `project`, `workspace`, or `cwd` arguments unless
the user explicitly references a *different* project by name** (e.g. "what
did we decide in the `other-app` project?"). Phrases like "this project",
"here", "we", "our work", and "where did we leave off" all mean the
*current* project, so call tools with no scoping args.

This default assumes the MCP client can identify the current agent
session. Static MCP clients in parallel sessions for the same user cannot
forward the real agent session id automatically; pass explicit
`workspace` + `project` / `scopes`, or use a session-aware bridge that
forwards the lifecycle-hook session id on MCP calls.

**Lifecycle hooks already capture sanitized, bounded prompt and tool-lifecycle
observations automatically.** They are not complete native transcripts;
managed `ai-memory run` launches add the portable visible-event ledger. Do not
manually write routine notes. Only write durable memory when the user explicitly asks
to remember or annotate something permanently.

### Use the installed ai-memory Agent Skills

Detailed tool-routing guidance lives in the installed ai-memory Agent
Skills. When a task matches an installed ai-memory Agent Skill, load and
follow that skill before calling ai-memory tools. The skills cover memory
retrieval, handoffs, durable pages, learning maintenance, and routing
install or refresh work.

### When you write a project rule, write it here

If you're about to write a durable project rule ("always X", "never
Y", "all PRs must ..."), write it in the project's canonical agent instruction file.
Many projects use CLAUDE.md for Claude Code and
AGENTS.md for Codex / OpenCode / Cursor / Gemini CLI / Grok Build CLI / Kimi Code,
but if the project says one file is canonical, use that file.

If the rule is a standing *user/team* preference that should apply to
every project (tech choices, code style, personal conventions), save it
to ai-memory's reserved global scope instead — the durable-pages skill
covers how. Default memory reads surface global-scope pages in every
project automatically.

### Refreshing this snippet

This block is maintained by ai-memory. Two ways to refresh it with the
latest binary's recommended copy:

- **From the agent** (no terminal needed): ask "refresh the ai-memory
  routing in this project". The agent calls `memory_install_self_routing`,
  picks the right filename for itself (Claude Code -> `CLAUDE.md`; Codex /
  OpenCode / Cursor / Gemini / Grok -> `AGENTS.md`; Kimi Code -> `AGENTS.md`),
  uses its Write / Edit tool to replace or append the returned
  `markered_block` while preserving
  non-ai-memory user content, then writes or updates each returned
  `managed_skills` item under the selected skill root from `target_hints`
  using its `relative_path`.
- **From the CLI**: `ai-memory install-instructions` (defaults to
  `CLAUDE.md`; pass `--target AGENTS.md` for non-Claude agents or projects
  that use `AGENTS.md` as the canonical instruction file).

Both are idempotent: re-runs replace the block delimited by the ai-memory
start/end HTML-comment markers, without disturbing the rest of the file.
<!-- ai-memory:end -->
