"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl border shadow-sm",
        paddings[padding],
        hover && "transition-all hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn("mb-3", className)}>{children}</div>
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={cn("text-lg font-semibold text-gray-900", className)}>{children}</h3>
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("", className)}>{children}</div>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn("mt-4 pt-4 border-t", className)}>{children}</div>
}