import {
  Building2,
  KeyRound,
  Mail,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store/auth.store";

const humanizePermission = (permission) => {
  if (!permission) {
    return "";
  }

  if (typeof permission === "string") {
    return permission.replaceAll("_", " ").replaceAll(":", " · ");
  }

  if (permission.label) {
    return permission.label;
  }

  if (permission.key) {
    return permission.key.replaceAll("_", " ").replaceAll(":", " · ");
  }

  return "";
};

const getRolePermissions = (roles = []) => {
  const permissionMap = new Map();

  roles.forEach((role) => {
    if (!Array.isArray(role?.permissions)) {
      return;
    }

    role.permissions.forEach((permission) => {
      const id = permission?._id || permission?.key || permission;

      if (!id) {
        return;
      }

      permissionMap.set(id, permission);
    });
  });

  return Array.from(permissionMap.values());
};

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const permissions = getRolePermissions(roles);

  return (
    <div className="feature-page">
      <PageHeader
        title="Profile"
        description="Review your account identity, assigned roles, department, and access summary."
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card className="feature-card h-fit">
          <CardHeader className="feature-card-header">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="size-4 text-muted-foreground" />
              Account identity
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="space-y-5 p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-muted text-lg font-semibold uppercase">
                  {(user?.name || user?.email || "U").slice(0, 1)}
                </div>

                <div className="min-w-0">
                  <p className="table-primary-text text-base font-semibold">
                    {user?.name || "-"}
                  </p>

                  <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    <span className="table-secondary-text">
                      {user?.email || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Account type
                  </p>
                  <p className="mt-1 font-medium">
                    {user?.isSuperAdmin ? "Super Admin" : "Standard User"}
                  </p>
                </div>

                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1 font-medium capitalize">
                    {user?.status || "-"}
                  </p>
                </div>

                <div className="rounded-xl border bg-background p-3">
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Department
                      </p>
                      <p className="mt-1 table-secondary-text font-medium">
                        {user?.department?.name ||
                          user?.department?.code ||
                          "No department"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="feature-card">
            <CardHeader className="feature-card-header">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-muted-foreground" />
                Assigned roles
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {roles.length ? (
                <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
                  {roles.map((role) => (
                    <div
                      key={role._id || role.code || role.name}
                      className="rounded-xl border bg-background p-3"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="table-primary-text text-sm font-medium">
                            {role.name}
                          </p>
                          <p className="mt-1 table-code-text">{role.code}</p>
                        </div>

                        {role.isSystemRole ? (
                          <Badge variant="secondary" className="rounded-md">
                            System
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="feature-table-empty">
                  <p className="text-sm text-muted-foreground">
                    No roles are assigned to this account.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="feature-card">
            <CardHeader className="feature-card-header">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-muted-foreground" />
                Access summary
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {user?.isSuperAdmin ? (
                <div className="p-4 sm:p-5">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-sm font-medium">Full access enabled</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Super Admin accounts have access to all permissions.
                    </p>
                  </div>
                </div>
              ) : permissions.length ? (
                <div className="grid gap-2 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
                  {permissions.map((permission) => (
                    <Badge
                      key={permission?._id || permission?.key || permission}
                      variant="outline"
                      className="justify-start rounded-md px-3 py-2 font-normal"
                    >
                      <span className="table-secondary-text">
                        {humanizePermission(permission)}
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="feature-table-empty">
                  <p className="text-sm text-muted-foreground">
                    No permissions are currently inherited from assigned roles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}