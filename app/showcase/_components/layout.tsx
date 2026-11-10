import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type SlotProps = { children: ReactNode; className?: string }

export const Row = ({ children, className }: SlotProps) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {children}
    </div>
  )
}

export const Stack = ({ children, className }: SlotProps) => {
  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-4", className)}>
      {children}
    </div>
  )
}

export const Caption = ({ children, className }: SlotProps) => {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  )
}

export const Labelled = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Caption>{label}</Caption>
      {children}
    </div>
  )
}
