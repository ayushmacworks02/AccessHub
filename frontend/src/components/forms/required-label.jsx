import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RequiredLabel({ children, className, required = false, ...props }) {
  return (
    <Label className={cn("gap-1", className)} {...props}>
      <span>{children}</span>
      {required ? <span className="text-destructive">*</span> : null}
    </Label>
  );
}