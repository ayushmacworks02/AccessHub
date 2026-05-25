import {
  AlertTriangle,
  CalendarClock,
  FileJson,
  MonitorCog,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
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

const getActorSubLabel = (audit) => {
  if (audit?.actor?.email && audit?.actor?.name) {
    return audit.actor.email;
  }

  if (audit?.actorEmail && audit?.actorName) {
    return audit.actorEmail;
  }

  return audit?.ipAddress || "No actor metadata";
};

const getResourceLabel = (audit) => {
  return audit?.resource || audit?.module || audit?.entityType || "-";
};

const getResourceId = (audit) => {
  return audit?.resourceId || audit?.entityId || audit?.targetId || "";
};

const getEventDescription = (audit) => {
  return audit?.description || audit?.message || "No event description available.";
};

function DetailCard({ label, children, icon: Icon }) {
  return (
    <div className="dialog-detail-card">
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="dialog-detail-label">{label}</p>
          <div className="mt-2 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuditDetailDialog() {
  const open = useAuditsStore((state) => state.detailDialogOpen);
  const audit = useAuditsStore((state) => state.selectedAudit);
  const closeDetailDialog = useAuditsStore((state) => state.closeDetailDialog);

  const metadata = audit?.metadata || audit?.details || {};
  const hasError = Boolean(audit?.errorMessage);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      closeDetailDialog();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        size="wide"
        className="flex max-h-[90svh] min-h-0 flex-col"
      >
        <AppDialogHeader
          icon={ShieldCheck}
          title="Audit details"
          description="Review the selected administrative event."
        />

        <AppDialogBody
          scrollable
          muted
          className="max-h-[68svh] space-y-4 p-4 sm:p-5"
        >
          {audit ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <DetailCard label="Action" icon={MonitorCog}>
                  <Badge variant="outline" className="rounded-md capitalize">
                    {humanizeText(audit.action)}
                  </Badge>
                </DetailCard>

                <DetailCard label="Time" icon={CalendarClock}>
                  <p className="table-secondary-text text-sm font-medium">
                    {formatDateTime(audit.createdAt)}
                  </p>
                </DetailCard>

                <DetailCard label="Resource" icon={ShieldCheck}>
                  <p className="table-primary-text text-sm font-medium capitalize">
                    {humanizeText(getResourceLabel(audit))}
                  </p>

                  {getResourceId(audit) ? (
                    <p className="mt-1 table-secondary-text font-mono text-xs text-muted-foreground">
                      {getResourceId(audit)}
                    </p>
                  ) : null}
                </DetailCard>

                <DetailCard label="Actor" icon={UserCircle}>
                  <p className="table-primary-text text-sm font-medium">
                    {getActorLabel(audit)}
                  </p>

                  <p className="mt-1 table-secondary-text text-xs text-muted-foreground">
                    {getActorSubLabel(audit)}
                  </p>
                </DetailCard>
              </div>

              <DetailCard label="Description" icon={FileJson}>
                <p className="text-sm leading-6 text-muted-foreground">
                  {getEventDescription(audit)}
                </p>
              </DetailCard>

              {hasError ? (
                <DetailCard label="Error" icon={AlertTriangle}>
                  <p className="text-sm leading-6 text-destructive">
                    {audit.errorMessage}
                  </p>
                </DetailCard>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileJson className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Metadata</p>
                </div>

                <pre className="dialog-json-block scrollbar-soft">
                  {formatJson(metadata)}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileJson className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Raw audit payload</p>
                </div>

                <pre className="dialog-json-block scrollbar-soft">
                  {formatJson(audit)}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center">
              <div>
                <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No audit selected</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select an audit event from the table to view details.
                </p>
              </div>
            </div>
          )}
        </AppDialogBody>
      </AppDialogContent>
    </Dialog>
  );
}