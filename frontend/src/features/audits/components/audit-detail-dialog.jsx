import { ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils/format-date";
import { useAuditsStore } from "@/features/audits/store/audits.store";

const humanizeText = (value) => {
  if (!value) {
    return "-";
  }

  return String(value).replaceAll("_", " ").replaceAll("-", " ");
};

const formatJson = (value) => {
  if (!value) {
    return "{}";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
};

const getActorLabel = (audit) => {
  if (audit?.actor?.name) {
    return audit.actor.name;
  }

  if (audit?.actor?.email) {
    return audit.actor.email;
  }

  if (audit?.actorName) {
    return audit.actorName;
  }

  if (audit?.actorEmail) {
    return audit.actorEmail;
  }

  return "System";
};

export function AuditDetailDialog() {
  const open = useAuditsStore((state) => state.detailDialogOpen);
  const audit = useAuditsStore((state) => state.selectedAudit);
  const closeDetailDialog = useAuditsStore((state) => state.closeDetailDialog);

  return (
    <Dialog open={open} onOpenChange={closeDetailDialog}>
      <DialogContent className="max-h-[92svh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3 pr-8">
            <div className="hidden size-9 shrink-0 items-center justify-center rounded-xl border bg-muted sm:flex">
              <ShieldCheck className="size-4 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <DialogTitle>Audit details</DialogTitle>
              <DialogDescription>
                Review the selected administrative event.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {audit ? (
          <div className="space-y-5 px-4 py-4 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Action</p>
                <div className="mt-2">
                  <Badge variant="outline" className="rounded-lg capitalize">
                    {humanizeText(audit.action)}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Resource</p>
                <p className="mt-2 text-sm font-medium capitalize">
                  {humanizeText(audit.resource)}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Actor</p>
                <p className="mt-2 text-sm font-medium">
                  {getActorLabel(audit)}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="mt-2 text-sm font-medium">
                  {formatDateTime(audit.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Resource ID</p>
                <p className="mt-2 break-all font-mono text-xs">
                  {audit.resourceId || "-"}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">IP Address</p>
                <p className="mt-2 text-sm font-medium">
                  {audit.ipAddress || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20">
              <div className="border-b px-3 py-2">
                <p className="text-sm font-medium">Metadata</p>
              </div>

              <pre className="scrollbar-soft max-h-80 overflow-auto p-3 text-xs leading-5">
                {formatJson(audit.metadata || audit.details || audit.extra)}
              </pre>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}