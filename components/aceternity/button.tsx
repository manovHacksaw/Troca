"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "outline"
type Size = "sm" | "md" | "lg"

export interface AButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const sizeMap: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
}

const variantMap: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/40 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm",
  outline: "bg-background text-foreground hover:bg-muted/60 border border-border shadow-sm",
}

export const AButton = React.forwardRef<HTMLButtonElement, AButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
          "backdrop-blur supports-[backdrop-filter]:bg-background/70",
          sizeMap[size],
          variantMap[variant],
          className,
        )}
        {...props}
      />
    )
  },
)
AButton.displayName = "AButton"
