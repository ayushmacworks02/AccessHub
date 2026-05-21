import { PageHeader } from "@/components/common/page-header";

export function AuditsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Review important authentication and administrative events."
      />

      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Audit logs table will be added next.
      </div>
    </div>
  );
}