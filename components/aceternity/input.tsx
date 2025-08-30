"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const AInput = React.forwardRef<HTMLInputElement, AInputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
        "backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
      {...props}
    />
  )
})
AInput.displayName = "AInput"
