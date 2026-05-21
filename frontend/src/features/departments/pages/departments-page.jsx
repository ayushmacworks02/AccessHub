import { Plus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organize users and roles into departments for cleaner access management."
        actions={
          <Button>
            <Plus className="size-4" />
            New Department
          </Button>
        }
      />

      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Departments table will be added next.
      </div>
    </div>
  );
}