import * as React from "react"
import { cn } from "../../lib/utils"
import { fieldClasses } from "../../recipes/field"

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  children?: React.ReactNode
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, children, ...props }, ref) => (
    <label className={fieldClasses.choice}>
      <input
        className={cn("sv-radio", className)}
        ref={ref}
        {...props}
        type="radio"
      />
      {children}
    </label>
  )
)
RadioGroupItem.displayName = "RadioGroupItem"

export interface RadioGroupProps
  extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "name"> {
  legend?: React.ReactNode
  legendHidden?: boolean
  orientation?: "vertical" | "horizontal"
  name?: string
}

// No React context API here — that constructor does not exist in Server
// Components (AD-002). Instead, `name` is injected directly into
// direct-child RadioGroupItems via React.Children.map — a child's own
// `name` always wins, and anything that isn't a direct-child RadioGroupItem
// (text, other elements, a wrapper, or a falsy child) passes through
// untouched.
const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    { className, legend, legendHidden, orientation = "vertical", name, children, ...props },
    ref
  ) => {
    const items = React.Children.map(children, (child) => {
      if (!React.isValidElement(child) || child.type !== RadioGroupItem) {
        return child
      }
      const itemProps = child.props as RadioGroupItemProps
      if (itemProps.name !== undefined) {
        return child
      }
      return React.cloneElement(child as React.ReactElement<RadioGroupItemProps>, { name })
    })

    return (
      <fieldset
        className={cn(
          "sv-radio-group",
          orientation === "horizontal" && "sv-radio-group--horizontal",
          className
        )}
        ref={ref}
        {...props}
      >
        {legend !== undefined && (
          <legend className={cn("sv-radio-group__legend", legendHidden && fieldClasses.srOnly)}>
            {legend}
          </legend>
        )}
        {items}
      </fieldset>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export { RadioGroup, RadioGroupItem }
