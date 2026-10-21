---
'@still-void/ui': minor
---

New `BottomSheet` family in `@still-void/ui/react/client` (`BottomSheet`, `BottomSheetTrigger`, `BottomSheetContent`, `BottomSheetHeader`, `BottomSheetBody`, `BottomSheetFooter`, `BottomSheetTitle`, `BottomSheetDescription`, `BottomSheetClose`, `BottomSheetOverlay`): a modal panel that rises from the bottom edge for mobile edit forms. Built on the Dialog primitive, so focus is trapped, Escape and the overlay dismiss, focus returns to the trigger, and `aria-modal` is always set. It has a drag handle (drag down past 96px to dismiss, `draggable={false}` to disable), a visible Cancel button (`closeLabel`, `showCloseButton`), respects the device safe area and `prefers-reduced-motion`, and uses only existing tokens. New classes: `sv-sheet`, `sv-sheet__handle`, `sv-sheet__close`, `sv-sheet__header`, `sv-sheet__body`, `sv-sheet__footer`, `sv-sheet__title`, `sv-sheet__description`; new keyframes `sv-sheet-in` / `sv-sheet-out`.
