import {
  Activity,
  Building2,
  ClipboardList,
  RefreshCcw,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";

function DashboardStatCard({ title, value, icon: Icon, description, enabled }) {
  if (!enabled) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">
          {value}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function DashboardStatSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>

      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const stats = useDashboardStats();

  const visibleCards = [
    stats.users.enabled,
    stats.roles.enabled,
    stats.departments.enabled,
    stats.audits.enabled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name || "User"}`}
        description="This is your AccessHub command center for users, roles, departments, permissions, and audit trails."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={stats.refetchAll}
            disabled={stats.isLoading}
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        }
      />

      {stats.isError ? (
        <ErrorState
          description="Unable to load dashboard statistics."
          onRetry={stats.refetchAll}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.isLoading ? (
            <>
              <DashboardStatSkeleton />
              <DashboardStatSkeleton />
              <DashboardStatSkeleton />
              <DashboardStatSkeleton />
            </>
          ) : (
            <>
              <DashboardStatCard
                title="Users"
                value={stats.users.total}
                icon={Users}
                description="Total user accounts available to your access scope."
                enabled={stats.users.enabled}
              />

              <DashboardStatCard
                title="Roles"
                value={stats.roles.total}
                icon={ShieldCheck}
                description="Reusable RBAC roles configured in the system."
                enabled={stats.roles.enabled}
              />

              <DashboardStatCard
                title="Departments"
                value={stats.departments.total}
                icon={Building2}
                description="Departments available for user and role mapping."
                enabled={stats.departments.enabled}
              />

              <DashboardStatCard
                title="Audit Logs"
                value={stats.audits.total}
                icon={ClipboardList}
                description="Administrative and security events captured."
                enabled={stats.audits.enabled}
              />
            </>
          )}
        </div>
      )}

      {!stats.isLoading && !stats.isError && visibleCards === 0 ? (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center text-center">
            <div>
              <Activity className="mx-auto size-8 text-muted-foreground" />
              <h2 className="mt-4 text-sm font-semibold">
                Limited dashboard access
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                You are signed in, but no dashboard statistics are available for
                your current permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="size-4" />
            Current session
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="mt-1 font-medium">{user?.name || "-"}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="mt-1 font-medium">{user?.email || "-"}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Account Type</p>
            <p className="mt-1 font-medium">
              {user?.isSuperAdmin ? "Super Admin" : "Standard User"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}