import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("sv-overlay", className)}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * The `X` in the corner. On by default because a modal without a pointer
   * affordance to leave it is the accessibility gap this closes; `false` is for
   * the deliberate case — a flow that must be resolved by an explicit choice.
   */
  showCloseButton?: boolean
  /**
   * The close button's accessible name. Defaults to the pre-existing hardcoded
   * English string so omitting it is a zero-behavior-change no-op; pass a
   * translated string (e.g. `"Fechar"`) instead of disabling the button
   * entirely just to avoid shipping untranslated UI.
   */
  closeLabel?: string
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, closeLabel = 'Close dialog', ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn("sv-dialog", className)}
      {...props}
      // Spread after props, not before: aria-modal is a guarantee this
      // component makes (CLIENT-05), not a default a caller can override by
      // passing its own aria-modal. Radix renders role="dialog" but never
      // aria-modal, so assistive tech was told nothing about the content
      // behind the panel being inert.
      aria-modal="true"
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close className="sv-dialog__close">
          <Icon name="x" />
          <span className="sv-sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("sv-dialog__header", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("sv-dialog__footer", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("sv-dialog__title", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("sv-dialog__description", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
