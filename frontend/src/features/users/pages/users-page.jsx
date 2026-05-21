import { Plus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Create and manage application users, departments, roles, and account status."
        actions={
          <Button>
            <Plus className="size-4" />
            New User
          </Button>
        }
      />

      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Users table will be added next.
      </div>
    </div>
  );
}