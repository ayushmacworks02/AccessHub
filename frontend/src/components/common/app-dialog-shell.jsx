import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const sizeClassMap = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
  wide: "sm:max-w-5xl",
};

export function AppDialogContent({
  children,
  className,
  size = "md",
  fixedHeight = false,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogContent
      showCloseButton={showCloseButton}
      className={cn(
        "gap-0 overflow-hidden p-0 shadow-xl ring-1 ring-border/80",
        "w-[calc(100vw-1.5rem)]",
        fixedHeight ? "flex h-[92svh] max-h-[92svh] flex-col" : "max-h-[92svh]",
        sizeClassMap[size] || sizeClassMap.md,
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

export function AppDialogHeader({
  title,
  description,
  icon: Icon,
  iconClassName,
  className,
}) {
  return (
    <DialogHeader
      className={cn(
        "shrink-0 border-b bg-background px-4 py-4 sm:px-6",
        className
      )}
    >
      <div className="flex items-start gap-3 pr-8">
        {Icon ? (
          <div className="hidden size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/60 sm:flex">
            <Icon className={cn("size-4 text-muted-foreground", iconClassName)} />
          </div>
        ) : null}

        <div className="min-w-0 space-y-1">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>

          {description ? (
            <DialogDescription className="text-sm leading-6">
              {description}
            </DialogDescription>
          ) : null}
        </div>
      </div>
    </DialogHeader>
  );
}

export function AppDialogBody({
  children,
  className,
  scrollable = false,
  muted = false,
}) {
  return (
    <div
      className={cn(
        "px-4 py-5 sm:px-6",
        scrollable && "scrollbar-soft min-h-0 flex-1 overflow-y-auto",
        muted && "bg-muted/20",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AppDialogFooter({ children, className }) {
  return (
    <DialogFooter
      className={cn(
        "mx-0 mb-0 shrink-0 rounded-none border-t bg-background px-4 py-4 sm:px-6",
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
    >
      {children}
    </DialogFooter>
  );
}