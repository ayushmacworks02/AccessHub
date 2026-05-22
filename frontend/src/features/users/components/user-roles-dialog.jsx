import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckCheck, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
import { useUsersStore } from "@/features/users/store/users.store";
import { useAssignUserRolesMutation } from "@/features/users/hooks/use-users";
import { useActiveRolesOptions } from "@/hooks/use-admin-options";
import { cn } from "@/lib/utils";

const SUPER_ADMIN_CODES = ["SUPER_ADMIN", "SUPERADMIN"];

const isSuperAdminRole = (role) => {
  return (
    Boolean(role?.isSystemRole) ||
    SUPER_ADMIN_CODES.includes(String(role?.code || "").toUpperCase())
  );
};

const normalizeRolesDraft = (values) => ({
  roles: Array.isArray(values?.roles) ? values.roles : [],
});

export function UserRolesDialog() {
  const open = useUsersStore((state) => state.rolesDialogOpen);
  const user = useUsersStore((state) => state.userForRoles);
  const rolesDraft = useUsersStore((state) => state.rolesDraft);
  const setRolesDraft = useUsersStore((state) => state.setRolesDraft);
  const closeRolesDialog = useUsersStore((state) => state.closeRolesDialog);

  const assignRolesMutation = useAssignUserRolesMutation();
  const rolesQuery = useActiveRolesOptions();

  const roles = rolesQuery.data || [];

  const form = useForm({
    defaultValues: rolesDraft,
    shouldUnregister: false,
  });

  const selectedRoles = form.watch("roles") || [];

  const superAdminRole = useMemo(() => {
    return roles.find((role) => isSuperAdminRole(role));
  }, [roles]);

  const hasSelectedSuperAdminRole = useMemo(() => {
    if (!superAdminRole?._id) {
      return false;
    }

    return selectedRoles.includes(superAdminRole._id);
  }, [selectedRoles, superAdminRole]);

  const hasNormalRoleSelected = useMemo(() => {
    return selectedRoles.some((roleId) => {
      const selectedRole = roles.find((role) => role._id === roleId);
      return selectedRole && !isSuperAdminRole(selectedRole);
    });
  }, [roles, selectedRoles]);

  useEffect(() => {
    if (open) {
      form.reset(rolesDraft);
    }
  }, [form, open, rolesDraft]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setRolesDraft(normalizeRolesDraft(form.getValues()));
      closeRolesDialog();
    }
  };

  const toggleRole = (roleId, checked) => {
    const currentRoles = form.getValues("roles") || [];
    const clickedRole = roles.find((role) => role._id === roleId);
    const clickedRoleIsSuperAdmin = isSuperAdminRole(clickedRole);

    if (checked && clickedRoleIsSuperAdmin) {
      form.setValue("roles", [roleId], {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    }

    if (checked) {
      const normalRoleIds = currentRoles.filter((id) => {
        const role = roles.find((roleItem) => roleItem._id === id);
        return !isSuperAdminRole(role);
      });

      form.setValue("roles", Array.from(new Set([...normalRoleIds, roleId])), {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    }

    form.setValue(
      "roles",
      currentRoles.filter((id) => id !== roleId),
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const onSubmit = (values) => {
    if (!user?._id) {
      return;
    }

    assignRolesMutation.mutate({
      userId: user._id,
      roles: values.roles || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        size="xl"
        className="flex max-h-[88svh] min-h-0 flex-col"
      >
        <AppDialogHeader
          icon={KeyRound}
          title="Manage user roles"
          description={
            user
              ? `Assign roles for "${user.name}".`
              : "Assign roles for this user."
          }
        />

        <form
          className="flex min-h-0 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="shrink-0 border-b bg-background px-4 py-3 sm:px-6">
            <div className="rounded-xl border bg-muted/30 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {selectedRoles.length} selected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Select Super Admin alone, or select one or more normal
                    roles.
                  </p>
                </div>

                {hasSelectedSuperAdminRole ? (
                  <Badge variant="secondary" className="rounded-lg">
                    <ShieldCheck className="size-3" />
                    Full access
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <AppDialogBody scrollable muted className="max-h-[52svh] space-y-3">
            {rolesQuery.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`user-role-skeleton-${index}`}
                    className="h-24 rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <Controller
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {roles.map((role) => {
                      const checked = field.value.includes(role._id);
                      const roleIsSuperAdmin = isSuperAdminRole(role);

                      const disabled =
                        (hasSelectedSuperAdminRole && !checked) ||
                        (roleIsSuperAdmin && hasNormalRoleSelected);

                      return (
                        <label
                          key={role._id}
                          className={cn(
                            "group flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4 transition-all",
                            "hover:border-foreground/20 hover:bg-muted/40",
                            checked &&
                              "border-primary/30 bg-primary/5 ring-1 ring-primary/15",
                            disabled &&
                              "cursor-not-allowed opacity-60 hover:bg-background"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={(value) =>
                              toggleRole(role._id, value === true)
                            }
                            className="mt-0.5"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="line-clamp-2 text-sm font-medium leading-5">
                                {role.name}
                              </span>

                              {checked ? (
                                <CheckCheck className="size-4 shrink-0 text-primary" />
                              ) : null}
                            </span>

                            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {roleIsSuperAdmin ? (
                                <Badge
                                  variant="secondary"
                                  className="rounded-md"
                                >
                                  <ShieldCheck className="size-3" />
                                  Full access
                                </Badge>
                              ) : null}

                              {role.code ? (
                                <span className="text-xs text-muted-foreground">
                                  {role.code}
                                </span>
                              ) : null}
                            </span>

                            {role.description ? (
                              <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                                {role.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}

                    {!roles.length ? (
                      <div className="col-span-full flex min-h-48 items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
                        <div>
                          <KeyRound className="mx-auto size-8 text-muted-foreground" />

                          <p className="mt-3 text-sm font-medium">
                            No active roles available
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Create or activate roles before assigning them to
                            users.
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              />
            )}

            {hasSelectedSuperAdminRole ? (
              <div className="rounded-xl border bg-background p-4 text-sm leading-6 text-muted-foreground">
                Super Admin has full access. Other roles are not required and
                cannot be combined with Super Admin.
              </div>
            ) : null}
          </AppDialogBody>

          <AppDialogFooter>
            <Button type="submit" disabled={assignRolesMutation.isPending}>
              {assignRolesMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving roles...
                </>
              ) : (
                "Save roles"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}