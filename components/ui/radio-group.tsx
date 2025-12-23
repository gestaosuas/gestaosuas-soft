'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
}

const RadioGroupContext = React.createContext<{
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
} | null>(null)

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value, onValueChange, disabled, children, ...props }, ref) => {
        return (
            <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
                <div
                    ref={ref}
                    className={cn("grid gap-2", className)}
                    {...props}
                >
                    {children}
                </div>
            </RadioGroupContext.Provider>
        )
    }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ className, label, value, ...props }, ref) => {
        const context = React.useContext(RadioGroupContext)
        const isChecked = context?.value === value

        return (
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                    <input
                        type="radio"
                        ref={ref}
                        value={value}
                        checked={isChecked}
                        onChange={() => context?.onValueChange?.(value as string)}
                        className={cn(
                            "peer h-5 w-5 appearance-none rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-transparent transition-all checked:border-blue-900 focus-visible:ring-2 focus-visible:ring-blue-900/20",
                            className
                        )}
                        {...props}
                    />
                    <div className="absolute h-2.5 w-2.5 rounded-full bg-blue-900 scale-0 transition-transform peer-checked:scale-100" />
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
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
