import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground text-cream/70",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground text-cream/60",
        link: "text-primary underline-offset-4 hover:underline",
        // Fashion Luxury variants
        gold: "bg-gradient-to-r from-gold to-gold-dark text-charcoal-deep font-semibold shadow-gold hover:shadow-lg hover:from-gold-light hover:to-gold hover:-translate-y-0.5 relative overflow-hidden",
        "gold-outline": "border-2 border-gold/40 text-gold bg-transparent hover:bg-gold/10 hover:border-gold font-semibold",
        "rose-gold": "bg-gradient-to-r from-rose-gold to-rose-gold-light text-charcoal-deep font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5",
        luxury: "bg-charcoal-light text-cream border border-gold/20 hover:border-gold/40 hover:bg-charcoal hover:shadow-gold font-medium",
        "dark-outline": "border border-cream/20 text-cream/70 bg-transparent hover:bg-cream/5 hover:border-cream/30 font-medium",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
