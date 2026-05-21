import { Plus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Create roles and assign reusable permission sets for scalable RBAC."
        actions={
          <Button>
            <Plus className="size-4" />
            New Role
          </Button>
        }
      />

      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Roles table will be added next.
      </div>
    </div>
  );
}