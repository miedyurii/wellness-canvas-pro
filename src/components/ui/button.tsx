import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
        destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90 hover:shadow-xl",
        outline: "border border-border bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-primary/50",
        secondary: "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground hover:backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        wellness: "bg-gradient-to-r from-secondary via-secondary to-accent text-secondary-foreground shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40",
        success: "bg-success text-success-foreground shadow-lg shadow-success/25 hover:bg-success/90 hover:shadow-xl",
        warning: "bg-warning text-warning-foreground shadow-lg shadow-warning/25 hover:bg-warning/90 hover:shadow-xl",
        floating: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 rounded-full border-2 border-white/20 backdrop-blur-sm",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
        floating: "h-14 w-14 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
