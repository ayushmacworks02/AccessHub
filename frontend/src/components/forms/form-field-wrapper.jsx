import { cn } from "@/lib/utils";

export function FormFieldWrapper({ label, error, required = false, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label className="flex items-center gap-1 text-sm font-medium leading-none">
          <span>{label}</span>
          {required ? <span className="text-destructive">*</span> : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}