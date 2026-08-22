---
"@still-void/ui": major
---

**Breaking:** removes the framework-agnostic core entry point (`import ... from '@still-void/ui'`). The package is now React/Next.js-only. Tokens and recipes moved to `@still-void/ui/react`; DOM behaviors (`createThemeManager`, `createScrollSpy`, `createReadingProgress`, `copyToClipboard`) moved to `@still-void/ui/react/client`. `react`/`react-dom` (>=18) are now required peer dependencies instead of optional. No token/design values changed. See `docs/migration-v1-to-v2.md` for the full import map; non-React consumers have no migration path and should stay on `^1`.
