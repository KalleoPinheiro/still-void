import * as React from "react"
import { cn } from "../../lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      className={cn("sv-check", className)}
      ref={ref}
      {...props}
      type="checkbox"
    />
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
