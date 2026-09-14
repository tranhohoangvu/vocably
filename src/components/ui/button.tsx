import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.96] transition-[opacity,transform,background-color,box-shadow,color] duration-150 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg hover:opacity-92",
        secondary: "bg-surface text-fg shadow-border hover:bg-bg-subtle",
        ghost: "text-muted hover:bg-bg-subtle hover:text-fg",
        outline: "bg-transparent text-fg shadow-border hover:bg-bg-subtle",
        destructive: "bg-again/10 text-again hover:bg-again/16",
      },
      size: {
        default: "h-11 px-4 rounded-[var(--radius-md)] text-sm",
        sm: "h-9 px-3 rounded-[var(--radius-sm)] text-sm",
        lg: "h-12 px-6 rounded-[var(--radius-md)] text-base",
        icon: "size-11 rounded-[var(--radius-md)]",
        "icon-sm": "size-9 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { buttonVariants };
