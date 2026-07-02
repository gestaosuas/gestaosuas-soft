'use client'

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, onCheckedChange, checked, ...props }, ref) => {
        return (
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                    <input
                        type="checkbox"
                        ref={ref}
                        checked={checked}
                        onChange={(e) => onCheckedChange?.(e.target.checked)}
                        className={cn(
                            "peer h-5 w-5 appearance-none rounded-md border-2 border-zinc-200 dark:border-zinc-800 bg-transparent transition-all checked:bg-blue-900 checked:border-blue-900 focus-visible:ring-2 focus-visible:ring-blue-900/20",
                            className
                        )}
                        {...props}
                    />
                    <Check className="absolute h-3.5 w-3.5 text-white scale-0 transition-transform peer-checked:scale-100" />
                </div>
                {label && (
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                        {label}
                    </span>
                )}
            </label>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
