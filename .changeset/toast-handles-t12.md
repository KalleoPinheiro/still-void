---
"@still-void/ui": minor
---

Add dismiss, dismissAll and update handles to useToast.

`toast()` returns `{ id, dismiss, update }` handle. `dismiss(id)` removes specific toast; `dismissAll()` empties queue. `update(patch)` modifies toast content in-place without remounting. Non-existent dismisses are no-op; double-dismiss on same handle is no-op.
