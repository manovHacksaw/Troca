"use client"
import Link from "next/link"
import type React from "react"

import { cn } from "@/lib/utils"

export type DockItem = {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
}

export function FloatingDock({
  items,
  className,
}: {
  items: DockItem[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40",
        "px-2 py-1 flex items-center gap-1 shadow-sm",
        className,
      )}
      role="navigation"
      aria-label="Main"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
            "text-foreground/70 hover:text-foreground",
            item.active ? "bg-primary/10 text-foreground" : "hover:bg-muted/60",
          )}
        >
          <span aria-hidden className="size-4">
            {item.icon}
          </span>
          <span className="hidden sm:inline">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
