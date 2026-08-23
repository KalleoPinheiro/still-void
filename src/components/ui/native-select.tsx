import * as React from "react"
import { cn } from "../../lib/utils"
import { field } from "../../recipes/field"

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      className={cn(field({ variant: "select" }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
