import * as React from "react"
import { cn } from "../../lib/utils"
import { field } from "../../recipes/field"

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(field({ variant: "file" }), className)}
      ref={ref}
      {...props}
      type="file"
    />
  )
)
FileInput.displayName = "FileInput"

export { FileInput }
