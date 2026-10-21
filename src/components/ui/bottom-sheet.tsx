import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "../../lib/utils"

/** How far (px) the handle must be dragged down before releasing dismisses. */
const DISMISS_DISTANCE = 96

// No default: Radix itself throws when Content renders outside a Root, so a
// fallback `close` would only be dead code.
const BottomSheetContext = React.createContext<{ close: () => void }>(null as never)

export interface BottomSheetProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>, "modal"> {}

/**
 * A modal panel that rises from the bottom edge — the mobile counterpart of
 * Dialog. Same Radix behavior underneath: focus is trapped, Escape and the
 * overlay dismiss, focus returns to the trigger. Open state may be controlled
 * (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`).
 */
const BottomSheet = ({ open: openProp, defaultOpen = false, onOpenChange, ...props }: BottomSheetProps) => {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : openState
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setOpenState(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )
  const value = React.useMemo(() => ({ close: () => setOpen(false) }), [setOpen])

  return (
    <BottomSheetContext.Provider value={value}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </BottomSheetContext.Provider>
  )
}

const BottomSheetTrigger = DialogPrimitive.Trigger

const BottomSheetClose = DialogPrimitive.Close

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn("sv-overlay", className)} {...props} />
))
BottomSheetOverlay.displayName = "BottomSheetOverlay"

export interface BottomSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * The visible Cancel button in the sheet's top-right corner. On by default so
   * every sheet has a pointer and keyboard way out besides the handle; `false`
   * is for a flow that must end with an explicit choice.
   */
  showCloseButton?: boolean
  /** Text of the Cancel button (also its accessible name). Blank counts as omitted. */
  closeLabel?: string
  /** Drag the handle down to dismiss. On by default; `false` leaves the handle decorative. */
  draggable?: boolean
}

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(
  (
    { className, children, style, showCloseButton = true, closeLabel: closeLabelProp, draggable = true, ...props },
    ref,
  ) => {
    const { close } = React.useContext(BottomSheetContext)
    const closeLabel = closeLabelProp && closeLabelProp.trim().length > 0 ? closeLabelProp : "Cancel"
    const [offset, setOffset] = React.useState(0)
    const [dragging, setDragging] = React.useState(false)
    const startY = React.useRef(0)

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable) return
      startY.current = event.clientY
      setDragging(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return
      setOffset(Math.max(0, event.clientY - startY.current))
    }
    const endDrag = () => {
      if (!dragging) return
      setDragging(false)
      if (offset >= DISMISS_DISTANCE) close()
      else setOffset(0)
    }

    return (
      <DialogPrimitive.Portal>
        <BottomSheetOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn("sv-sheet", className)}
          data-dragging={dragging ? "true" : undefined}
          style={{ ...style, ["--sv-sheet-drag" as string]: `${offset}px` }}
          {...props}
          // A guarantee of this component, not a default a caller can override.
          aria-modal="true"
        >
          <div
            className="sv-sheet__handle"
            data-draggable={draggable ? "true" : undefined}
            aria-hidden="true"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          {showCloseButton ? (
            <DialogPrimitive.Close className="sv-btn sv-btn--ghost sv-btn--sm sv-sheet__close">
              {closeLabel}
            </DialogPrimitive.Close>
          ) : null}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    )
  },
)
BottomSheetContent.displayName = "BottomSheetContent"

const BottomSheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("sv-sheet__header", className)} {...props} />
)
BottomSheetHeader.displayName = "BottomSheetHeader"

const BottomSheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("sv-sheet__body", className)} {...props} />
)
BottomSheetBody.displayName = "BottomSheetBody"

const BottomSheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("sv-sheet__footer", className)} {...props} />
)
BottomSheetFooter.displayName = "BottomSheetFooter"

const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("sv-sheet__title", className)} {...props} />
))
BottomSheetTitle.displayName = "BottomSheetTitle"

const BottomSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("sv-sheet__description", className)} {...props} />
))
BottomSheetDescription.displayName = "BottomSheetDescription"

export {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetOverlay,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
}
