import { PageHeader } from "@/components/common/page-header";

export function PermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="View system permissions generated from backend modules."
      />

      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Permissions list will be added next.
      </div>
    </div>
  );
}