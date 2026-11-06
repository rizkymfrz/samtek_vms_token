import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type SlotProps = { children: ReactNode; className?: string }

export function Row({ children, className }: SlotProps) {
  return <div className={cn("flex flex-wrap items-center gap-4", className)}>{children}</div>
}

export function Stack({ children, className }: SlotProps) {
  return <div className={cn("flex w-full max-w-sm flex-col gap-4", className)}>{children}</div>
}

export function Caption({ children, className }: SlotProps) {
  return <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
}

export function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Caption>{label}</Caption>
      {children}
    </div>
  )
}
