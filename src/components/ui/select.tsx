import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

/**
 * `icon` is the same contract on every member that owns an indicator slot
 * (CLIENT-14): omit it and the system icon renders, pass a node and that node
 * takes the slot, pass `null` and nothing is rendered at all so the slot
 * collapses. `null` has to be distinguishable from "omitted", which is why the
 * default lives in the parameter — a default only fires on `undefined`.
 */
export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  icon?: React.ReactNode
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    { className, children, icon = <Icon name="chevron-down" />, ...props },
    ref
  ) => (
    // The trigger IS a form field, so it shares .sv-field with Input, Textarea
    // and NativeSelect rather than restating the frame. The utility string this
    // replaces named `ring-offset-background` and `focus:ring-accent`, neither
    // of which this package ever declared: the field had no visible focus.
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn("sv-field", className)}
      {...props}
    >
      {children}
      {icon === null ? null : (
        <SelectPrimitive.Icon>{icon}</SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("sv-pop__scroll", className)}
    {...props}
  >
    <Icon name="chevron-up" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("sv-pop__scroll", className)}
    {...props}
  >
    <Icon name="chevron-down" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = "SelectScrollDownButton"

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    {/*
      In "popper" mode Radix anchors the panel to the trigger and sets
      data-side/data-align for the flip it resolved; "item-aligned" has no
      anchor to nudge against, so the modifier only applies in the former.
      The old Tailwind build carried this as
      `position === "popper" && "data-[side=bottom]:translate-y-1 ..."` —
      same behavior, ported to .sv-pop--popper/[data-side] in style.css.
    */}
    <SelectPrimitive.Content
      ref={ref}
      className={cn("sv-pop", position === "popper" && "sv-pop--popper", className)}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "sv-pop__viewport",
          position === "popper" && "sv-pop__viewport--popper",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  icon?: React.ReactNode
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, icon = <Icon name="check" />, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn("sv-menu-item", className)}
    {...props}
  >
    {icon === null ? null : (
      <SelectPrimitive.ItemIndicator className="sv-menu-item__indicator">
        {icon}
      </SelectPrimitive.ItemIndicator>
    )}
    {/*
      CLIENT-13. Without ItemText the children are plain markup inside the
      option: Radix has nothing to portal into the trigger, and SelectValue —
      which renders nothing of its own once a value is set — leaves the trigger
      BLANK the moment the user picks something. ItemText both labels the option
      and feeds the trigger, so it is not optional decoration.
    */}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = "SelectItem"

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("sv-menu-label", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("sv-menu-separator", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
