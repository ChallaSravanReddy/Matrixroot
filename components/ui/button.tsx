import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[#8B4513]/20 bg-white text-[#3D2B1F] hover:bg-[#F9F5F0]",
        secondary: "bg-[#F0EAE1] text-[#3D2B1F] hover:bg-[#E5DDCF]",
        ghost: "hover:bg-[#F0EAE1] text-[#3D2B1F]",
        link: "text-[#8B4513] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] h-11 px-6 py-2",
        sm: "min-h-[40px] h-10 rounded-[12px] px-4 text-sm",
        lg: "min-h-[56px] h-14 rounded-[12px] px-10 text-base font-medium",
        icon: "min-h-[44px] h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
