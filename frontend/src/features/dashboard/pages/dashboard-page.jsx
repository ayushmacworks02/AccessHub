import {
  Building2,
  ClipboardList,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store/auth.store";

const stats = [
  {
    title: "Users",
    value: "Manage",
    icon: Users,
    description: "Create, update, and control user access.",
  },
  {
    title: "Roles",
    value: "RBAC",
    icon: ShieldCheck,
    description: "Compose permissions into reusable roles.",
  },
  {
    title: "Departments",
    value: "Teams",
    icon: Building2,
    description: "Organize users and roles by department.",
  },
  {
    title: "Audits",
    value: "Trace",
    icon: ClipboardList,
    description: "Review administrative activity logs.",
  },
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name || "User"}`}
        description="This is your AccessHub command center for users, roles, departments, permissions, and audit trails."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">
                  {item.value}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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