import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    resize?: "none" | "both" | "horizontal" | "vertical" // Add resize prop
    error?: boolean // Add error state
  }
>(({ className, resize = "vertical", error = false, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-all",
        "min-h-[80px] placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-destructive ring-destructive" : "border-input",
        {
          "resize-none": resize === "none",
          "resize": resize === "both",
          "resize-x": resize === "horizontal",
          "resize-y": resize === "vertical",
        },
        className
      )}
      ref={ref}
      style={{ resize }} // Apply resize style dynamically
      aria-invalid={error} // Accessibility improvement
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"

export { Textarea }