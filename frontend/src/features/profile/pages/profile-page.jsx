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
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Review your account identity, assigned roles, department, and access summary."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="h-fit border-border/80">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="size-4 text-muted-foreground" />
              Account identity
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-muted text-lg font-semibold uppercase">
                {(user?.name || user?.email || "U").slice(0, 2)}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold">
                    {user?.name || "User"}
                  </p>

                  {user?.isSuperAdmin ? (
                    <Badge variant="outline" className="rounded-lg">
                      <ShieldCheck className="size-3" />
                      Super Admin
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {user?.email || "-"}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-2 text-sm font-medium capitalize">
                  {user?.status || "-"}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Account type
                </p>
                <p className="mt-2 text-sm font-medium">
                  {user?.isSuperAdmin ? "Super Admin" : "Standard User"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-muted-foreground" />
                Contact details
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="mt-2 text-sm font-medium">
                  {user?.name || "-"}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="mt-2 break-all text-sm font-medium">
                  {user?.email || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-muted-foreground" />
                Department
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {user?.department ? (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-sm font-medium">
                    {user.department.name}
                  </p>

                  {user.department.code ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {user.department.code}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                  <Building2 className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">
                    No department assigned
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your account is currently not mapped to a department.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-muted-foreground" />
                Roles
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {roles.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {roles.map((role) => (
                    <div
                      key={role._id || role.code || role.name}
                      className="rounded-xl border bg-muted/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium">
                            {role.name || role.code || "Role"}
                          </p>

                          {role.code ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {role.code}
                            </p>
                          ) : null}
                        </div>

                        {role.isSystemRole ? (
                          <Badge variant="outline" className="shrink-0 rounded-lg">
                            System
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                  <KeyRound className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">
                    No roles assigned
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your access is currently not mapped to any role.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-muted-foreground" />
                Permissions summary
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {user?.isSuperAdmin ? (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-sm font-medium">
                    Full administrative access
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    This account has Super Admin privileges and can access all
                    protected administrative capabilities.
                  </p>
                </div>
              ) : permissions.length ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {permissions.slice(0, 18).map((permission) => {
                    const label = humanizePermission(permission);

                    return (
                      <div
                        key={permission?._id || permission?.key || label}
                        className="rounded-lg border bg-muted/20 px-3 py-2 text-sm"
                      >
                        {label}
                      </div>
                    );
                  })}

                  {permissions.length > 18 ? (
                    <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                      +{permissions.length - 18} more permissions
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                  <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">
                    No permissions found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Permissions will appear here when assigned through roles.
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