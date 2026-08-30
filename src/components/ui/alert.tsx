import * as React from "react"
import { cn } from "../../lib/utils"
import { Icon, type IconName } from "./icon"

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  icon?: React.ReactNode | null
  action?: React.ReactNode
}

// Map variant to derived role and default icon
const variantConfig: Record<AlertVariant, { role: 'alert' | 'status'; icon: IconName }> = {
  info: { role: 'status', icon: 'info' },
  success: { role: 'status', icon: 'check-circle' },
  warning: { role: 'alert', icon: 'alert-triangle' },
  danger: { role: 'alert', icon: 'alert-circle' },
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, action, role: propRole, ...props }, ref) => {
    // Validate variant: only use if it's a known own key (guards against
    // inherited names like "constructor"/"toString" matching via `in`)
    const config =
      variant && Object.prototype.hasOwnProperty.call(variantConfig, variant)
        ? variantConfig[variant]
        : null
    const derivedRole = config?.role ?? 'alert'
    // Derived role wins over prop role; without variant, force 'alert' unconditionally
    const effectiveRole = config ? derivedRole : 'alert'

    // Determine if icon should be rendered
    let iconElement: React.ReactNode = null
    if (icon !== null) {
      if (icon !== undefined) {
        // Render every non-null explicit node (element, string, number, array)
        iconElement = icon
      } else if (config) {
        // Render default icon for this variant
        iconElement = <Icon name={config.icon} aria-hidden="true" />
      }
    }

    return (
      <div
        ref={ref}
        className={cn("sv-alert", config && `sv-alert--${variant}`, className)}
        role={effectiveRole}
        {...props}
      >
        {iconElement}
        {props.children}
        {action && <div className="sv-alert__action">{action}</div>}
      </div>
    )
  },
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("sv-alert__title", className)} {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("sv-alert__description", className)} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
