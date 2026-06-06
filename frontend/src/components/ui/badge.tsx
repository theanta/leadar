import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-card text-foreground",
        secondary: "bg-surface-soft text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border text-foreground bg-transparent",
        success: "bg-brand-mint text-foreground",
        warning: "bg-brand-ochre text-foreground",
        info: "bg-brand-lavender text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
