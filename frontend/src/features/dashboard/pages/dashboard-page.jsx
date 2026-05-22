import {
  Activity,
  Building2,
  ClipboardList,
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
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";

function DashboardStatCard({ title, value, icon: Icon, description, enabled }) {
  if (!enabled) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border/80">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function DashboardStatSkeleton() {
  return (
    <Card className="border-border/80">
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
      />

      {stats.isError ? (
        <ErrorState description="Unable to load dashboard statistics." />
      ) : null}

      {stats.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: Math.max(visibleCards, 4) }).map((_, index) => (
            <DashboardStatSkeleton key={`dashboard-stat-skeleton-${index}`} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            title="Users"
            value={stats.users.total}
            icon={Users}
            enabled={stats.users.enabled}
            description="Total users available under your current access."
          />

          <DashboardStatCard
            title="Roles"
            value={stats.roles.total}
            icon={ShieldCheck}
            enabled={stats.roles.enabled}
            description="Reusable role groups configured for access control."
          />

          <DashboardStatCard
            title="Departments"
            value={stats.departments.total}
            icon={Building2}
            enabled={stats.departments.enabled}
            description="Departments used to organize users and roles."
          />

          <DashboardStatCard
            title="Audit Logs"
            value={stats.audits.total}
            icon={ClipboardList}
            enabled={stats.audits.enabled}
            description="Recorded system and access management activities."
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-muted-foreground" />
              Workspace overview
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Use the navigation menu to manage users, roles, departments,
              permissions, and audit logs. Available sections depend on your
              assigned permissions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCog className="size-4 text-muted-foreground" />
              Access control model
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              AccessHub uses role-based access control. Users receive roles,
              roles contain permissions, and Super Admin accounts have full
              administrative access.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}