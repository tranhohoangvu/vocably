import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        muted: "bg-bg-subtle text-muted",
        primary: "bg-primary/10 text-primary",
        new: "bg-bg-subtle text-new",
        learning: "bg-learning/12 text-learning",
        review: "bg-review/12 text-review",
        known: "bg-known/12 text-known",
        again: "bg-again/12 text-again",
        hard: "bg-hard/12 text-hard",
        good: "bg-good/12 text-good",
        easy: "bg-easy/12 text-easy",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
