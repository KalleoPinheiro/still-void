---
"@still-void/ui": patch
---

Fix `.sv-app-sidebar__label` shipping a Sora/1.125rem/600 default that fought whatever it wrapped and violated the Sparse-Display Rule (Sora never sets label/body text) the moment a consumer applied the class to ordinary nav-item text, as the App Sidebar Storybook demo did. The class now carries no typography of its own — it only participates in the collapsed-state hiding rule — and inherits font from whatever it wraps, as intended.
