import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full shadow-border transition-[background-color] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        checked ? "bg-primary" : "bg-bg-subtle",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 rounded-full bg-surface shadow-border transition-transform duration-150 ease-out",
          "translate-x-1 data-[state=checked]:translate-x-6",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
