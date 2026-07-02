import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea"> & { autoResize?: boolean }>(
    ({ className, autoResize, ...props }, ref) => {
        const internalRef = React.useRef<HTMLTextAreaElement>(null)
        const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

        const adjustHeight = () => {
            const textarea = textareaRef.current
            if (textarea && autoResize) {
                textarea.style.height = "auto"
                textarea.style.height = `${textarea.scrollHeight}px`
            }
        }

        React.useEffect(() => {
            if (autoResize) {
                adjustHeight()
            }
        }, [props.value, autoResize])

        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    autoResize && "resize-none overflow-hidden transition-[height] duration-200",
                    className
                )}
                ref={textareaRef}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
