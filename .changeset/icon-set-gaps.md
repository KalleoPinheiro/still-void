---
"@still-void/ui": minor
---

`IconName` gains three values: `camera`, `blocked`, and `pending` (backed by heroicons' `CameraIcon`, `NoSymbolIcon`, and `ClockIcon`, same as every other entry in the curated set). Closes a gap where consumers rendering "camera", "blocked lot" or "pending lot" indicators had no matching icon and fell back to raw Unicode glyphs as text.
