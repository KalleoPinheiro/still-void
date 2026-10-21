---
'@still-void/ui': patch
---

Light mode: the text "ink" steps now stay at 4.5:1 or better when placed on a 10% tint of their own hue (soft chips, active rows, badges), not only on the flat surfaces. Each step moves 0.005 to 0.02 in OKLCH lightness (`--sv-accent-{cyan,violet,mint}-ink`, `--sv-accent-amber-ink`, `--sv-danger-ink`, `--sv-success-ink`, `--sv-info-ink`, `--sv-warning-ink`), an imperceptible change that only corrects the contrast. Consumers using their own tint above 10% should keep it at 10% or below. No class or variable was renamed.
