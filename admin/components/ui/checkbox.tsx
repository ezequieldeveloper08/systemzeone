import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only"
          ref={ref}
          {...props}
        />
        <div
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            "flex size-4.5 cursor-pointer items-center justify-center rounded border border-neutral-300 transition-all dark:border-neutral-700",
            checked
              ? "bg-neutral-950 text-neutral-50 border-neutral-950 dark:bg-neutral-50 dark:text-neutral-950 dark:border-neutral-50"
              : "bg-transparent hover:border-neutral-400 dark:hover:border-neutral-600"
          )}
        >
          {checked && <Check className="size-3.5 stroke-[3]" />}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
