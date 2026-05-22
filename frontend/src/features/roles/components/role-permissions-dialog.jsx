import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckCheck, Loader2, Search, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
import { useGroupedPermissionsQuery } from "@/features/permissions/hooks/use-permissions-query";
import { useReplaceRolePermissionsMutation } from "@/features/roles/hooks/use-roles";
import { useRolesStore } from "@/features/roles/store/roles.store";
import { cn } from "@/lib/utils";

const normalizePermissionsDraft = (values) => ({
  search: values?.search || "",
  permissions: Array.isArray(values?.permissions) ? values.permissions : [],
});

export function RolePermissionsDialog() {
  const open = useRolesStore((state) => state.permissionsDialogOpen);
  const role = useRolesStore((state) => state.roleForPermissions);

  const permissionsDraft = useRolesStore((state) => state.permissionsDraft);
  const setPermissionsDraft = useRolesStore(
    (state) => state.setPermissionsDraft
  );
  const closePermissionsDialog = useRolesStore(
    (state) => state.closePermissionsDialog
  );

  const groupedPermissionsQuery = useGroupedPermissionsQuery();
  const replacePermissionsMutation = useReplaceRolePermissionsMutation();

  const form = useForm({
    defaultValues: permissionsDraft,
    shouldUnregister: false,
  });

  const search = form.watch("search") || "";
  const selectedPermissions = form.watch("permissions") || [];

  const groupedPermissions = groupedPermissionsQuery.data || [];

  const isPending = replacePermissionsMutation.isPending;
  const isSystemRole = Boolean(role?.isSystemRole);

  useEffect(() => {
    if (open) {
      form.reset(permissionsDraft);
    }
  }, [form, open, permissionsDraft]);

  const totalPermissions = useMemo(() => {
    return groupedPermissions.reduce(
      (count, group) => count + group.permissions.length,
      0
    );
  }, [groupedPermissions]);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return groupedPermissions;
    }

    return groupedPermissions
      .map((group) => {
        const permissions = group.permissions.filter((permission) => {
          return (
            permission.label?.toLowerCase().includes(normalizedSearch) ||
            permission.description?.toLowerCase().includes(normalizedSearch) ||
            permission.module?.toLowerCase().includes(normalizedSearch) ||
            permission.action?.toLowerCase().includes(normalizedSearch) ||
            permission.key?.toLowerCase().includes(normalizedSearch)
          );
        });

        return {
          ...group,
          permissions,
        };
      })
      .filter((group) => group.permissions.length > 0);
  }, [groupedPermissions, search]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setPermissionsDraft(normalizePermissionsDraft(form.getValues()));
      closePermissionsDialog();
    }
  };

  const togglePermission = (permissionId, checked) => {
    const currentPermissions = form.getValues("permissions") || [];

    if (checked) {
      form.setValue(
        "permissions",
        Array.from(new Set([...currentPermissions, permissionId])),
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      );

      return;
    }

    form.setValue(
      "permissions",
      currentPermissions.filter((id) => id !== permissionId),
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const toggleGroup = (permissionIds, checked) => {
    const currentPermissions = form.getValues("permissions") || [];

    if (checked) {
      form.setValue(
        "permissions",
        Array.from(new Set([...currentPermissions, ...permissionIds])),
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      );

      return;
    }

    form.setValue(
      "permissions",
      currentPermissions.filter((id) => !permissionIds.includes(id)),
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const onSubmit = (values) => {
    if (!role?._id || isSystemRole) {
      return;
    }

    replacePermissionsMutation.mutate({
      roleId: role._id,
      permissions: values.permissions || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        size="wide"
        className="flex max-h-[92svh] min-h-0 flex-col"
      >
        <AppDialogHeader
          icon={ShieldCheck}
          title="Manage permissions"
          description={
            role
              ? `Assign permissions for "${role.name}".`
              : "Assign permissions for this role."
          }
        />

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="shrink-0 border-b bg-background px-4 py-4 sm:px-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <Controller
                control={form.control}
                name="search"
                render={({ field }) => (
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Search permissions by label, module, action, or key..."
                      className="h-10 pl-9"
                    />
                  </div>
                )}
              />

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="h-9 rounded-lg px-3">
                  {selectedPermissions.length} selected
                </Badge>

                <Badge variant="secondary" className="h-9 rounded-lg px-3">
                  {totalPermissions} available
                </Badge>
              </div>
            </div>

            {isSystemRole ? (
              <div className="mt-4 rounded-xl border bg-muted/40 px-4 py-3 text-sm leading-6 text-muted-foreground">
                This is a system role. Super Admin permissions are managed by
                the system and cannot be modified here.
              </div>
            ) : null}
          </div>

          <AppDialogBody
            scrollable
            muted
            className="max-h-[58svh] space-y-4"
          >
            {groupedPermissionsQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, groupIndex) => (
                  <div
                    key={`permission-group-skeleton-${groupIndex}`}
                    className="rounded-xl border bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="mt-2 h-4 w-24" />
                      </div>

                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((__, itemIndex) => (
                        <Skeleton
                          key={`permission-item-skeleton-${groupIndex}-${itemIndex}`}
                          className="h-24 rounded-xl"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length ? (
              <Controller
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <div className="space-y-4">
                    {filteredGroups.map((group) => {
                      const permissionIds = group.permissions.map(
                        (permission) => permission._id
                      );

                      const selectedCount = permissionIds.filter((id) =>
                        field.value.includes(id)
                      ).length;

                      const allSelected =
                        permissionIds.length > 0 &&
                        selectedCount === permissionIds.length;

                      const partiallySelected =
                        selectedCount > 0 &&
                        selectedCount < permissionIds.length;

                      return (
                        <section
                          key={group.module}
                          className="overflow-hidden rounded-xl border bg-background shadow-sm"
                        >
                          <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold">
                                {group.label || group.module}
                              </h3>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {selectedCount} of {permissionIds.length}{" "}
                                selected
                              </p>
                            </div>

                            <label
                              className={cn(
                                "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted",
                                isSystemRole &&
                                  "cursor-not-allowed opacity-60 hover:bg-background"
                              )}
                            >
                              <span>Select all</span>

                              <Checkbox
                                disabled={isSystemRole}
                                checked={
                                  allSelected
                                    ? true
                                    : partiallySelected
                                      ? "indeterminate"
                                      : false
                                }
                                onCheckedChange={(checked) =>
                                  toggleGroup(permissionIds, checked === true)
                                }
                                aria-label={`Select all ${
                                  group.label || group.module
                                } permissions`}
                              />
                            </label>
                          </div>

                          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                            {group.permissions.map((permission) => {
                              const checked = field.value.includes(
                                permission._id
                              );

                              return (
                                <label
                                  key={permission._id}
                                  className={cn(
                                    "group flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-all",
                                    "hover:border-foreground/20 hover:bg-muted/40",
                                    checked &&
                                      "border-primary/30 bg-primary/5 ring-1 ring-primary/15",
                                    isSystemRole &&
                                      "cursor-not-allowed opacity-70 hover:bg-card"
                                  )}
                                >
                                  <Checkbox
                                    disabled={isSystemRole}
                                    checked={checked}
                                    onCheckedChange={(value) =>
                                      togglePermission(
                                        permission._id,
                                        value === true
                                      )
                                    }
                                    className="mt-0.5"
                                  />

                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-start justify-between gap-2">
                                      <span className="line-clamp-2 text-sm font-medium leading-5">
                                        {permission.label}
                                      </span>

                                      {checked ? (
                                        <CheckCheck className="size-4 shrink-0 text-primary" />
                                      ) : null}
                                    </span>

                                    {permission.description ? (
                                      <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                                        {permission.description}
                                      </span>
                                    ) : null}

                                    {permission.key ? (
                                      <span className="mt-2 block truncate text-[11px] text-muted-foreground/80">
                                        {permission.key}
                                      </span>
                                    ) : null}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              />
            ) : (
              <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
                <div>
                  <ShieldCheck className="mx-auto size-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No permissions found
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different search term.
                  </p>
                </div>
              </div>
            )}
          </AppDialogBody>

          <AppDialogFooter>
            <Button type="submit" disabled={isPending || isSystemRole}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving permissions...
                </>
              ) : (
                "Save permissions"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}