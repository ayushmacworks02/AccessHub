import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckCheck, Loader2, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    if (open) {
      form.reset(permissionsDraft);
    }
  }, [form, permissionsDraft, open]);

  const groupedPermissions = groupedPermissionsQuery.data || [];

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
            permission.action?.toLowerCase().includes(normalizedSearch)
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
    if (!role?._id) {
      return;
    }

    replacePermissionsMutation.mutate({
      roleId: role._id,
      permissions: values.permissions || [],
    });
  };

  const isPending = replacePermissionsMutation.isPending;
  const isSystemRole = Boolean(role?.isSystemRole);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[92svh] max-h-[92svh] min-h-0 w-[calc(100vw-1.5rem)] flex-col overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3 pr-8">
            <div className="hidden size-9 shrink-0 items-center justify-center rounded-xl border bg-muted sm:flex">
              <ShieldCheck className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 space-y-1">
              <DialogTitle className="truncate">
                Manage permissions
              </DialogTitle>

              <DialogDescription className="line-clamp-2">
                {role
                  ? `Assign permissions for "${role.name}".`
                  : "Assign permissions for this role."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="shrink-0 border-b bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search permissions by label, module, or action..."
                  className="h-9 pl-8"
                  {...form.register("search")}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="h-8 rounded-lg px-3">
                  {selectedPermissions.length} selected
                </Badge>

                <Badge variant="secondary" className="h-8 rounded-lg px-3">
                  {totalPermissions} available
                </Badge>
              </div>
            </div>

            {isSystemRole ? (
              <div className="mt-3 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                This is a system role. Super Admin permissions are managed by
                the system and cannot be modified here.
              </div>
            ) : null}
          </div>

          <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto bg-muted/20 px-3 py-3 sm:px-6 sm:py-4">
            {groupedPermissionsQuery.isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={`permission-skeleton-${index}`}
                    className="h-28 w-full rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <Controller
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <div className="grid gap-3">
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
                          className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3 border-b bg-muted/35 px-4 py-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold">
                                {group.label}
                              </h3>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {selectedCount} of {permissionIds.length}{" "}
                                selected
                              </p>
                            </div>

                            <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
                              <span className="hidden sm:inline">
                                Select all
                              </span>

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
                                aria-label={`Select all ${group.label} permissions`}
                              />
                            </label>
                          </div>

                          <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                            {group.permissions.map((permission) => {
                              const checked = field.value.includes(
                                permission._id
                              );

                              return (
                                <label
                                  key={permission._id}
                                  className={cn(
                                    "group flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-all",
                                    "hover:border-foreground/20 hover:bg-muted/40",
                                    checked &&
                                      "border-primary/30 bg-primary/5 ring-1 ring-primary/15"
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
                                      <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                                        {permission.description}
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

                    {!filteredGroups.length ? (
                      <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                        No permissions found for your search.
                      </div>
                    ) : null}
                  </div>
                )}
              />
            )}
          </div>

          <DialogFooter className="shrink-0 border-t bg-background px-4 py-4 sm:px-6">
            <div className="flex w-full justify-end">
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
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}