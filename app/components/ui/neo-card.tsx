import * as React from "react"
import { cn } from "~/lib/utils"

interface NeoCardProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
  hover?: boolean;
}

function NeoCard({ className, size = "sm", hover = true, ...props }: NeoCardProps) {
  const sizeClasses = {
    sm: "rounded-xl border-2",
    md: "rounded-2xl border-[3px]",
    lg: "rounded-2xl border-[3px]",
  };

  const shadowClasses = {
    sm: hover ? "shadow-[3px_3px_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]" : "shadow-[3px_3px_0_rgba(0,0,0,1)]",
    md: hover ? "shadow-[6px_6px_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]" : "shadow-[6px_6px_0_rgba(0,0,0,1)]",
    lg: hover ? "shadow-[8px_8px_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]" : "shadow-[8px_8px_0_rgba(0,0,0,1)]",
  };

  return (
    <div
      data-slot="neo-card"
      className={cn(
        "bg-white text-card-foreground flex flex-col border-black transition-all duration-200",
        sizeClasses[size],
        shadowClasses[size],
        className
      )}
      {...props}
    />
  )
}

function NeoCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neo-card-header"
      className={cn(
        "flex flex-col space-y-1.5",
        className
      )}
      {...props}
    />
  )
}

function NeoCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neo-card-title"
      className={cn("leading-none font-bold", className)}
      {...props}
    />
  )
}

function NeoCardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neo-card-description"
      className={cn("text-[#666] text-sm font-semibold", className)}
      {...props}
    />
  )
}

function NeoCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neo-card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function NeoCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neo-card-footer"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

export {
  NeoCard,
  NeoCardHeader,
  NeoCardFooter,
  NeoCardTitle,
  NeoCardDescription,
  NeoCardContent,
}
