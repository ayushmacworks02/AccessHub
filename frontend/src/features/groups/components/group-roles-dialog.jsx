import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Check, KeyRound, Loader2, Search } from "lucide-react";

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
import { useGroupsStore } from "@/features/groups/store/groups.store";
import { useAssignGroupRolesMutation } from "@/features/groups/hooks/use-groups";
import { useActiveRolesOptions } from "@/hooks/use-admin-options";
import { cn } from "@/lib/utils";

const SUPER_ADMIN_CODES = ["SUPER_ADMIN", "SUPERADMIN"];

const isSuperAdminRole = (role) => {
  return (
    Boolean(role?.isSystemRole) ||
    SUPER_ADMIN_CODES.includes(String(role?.code || "").toUpperCase())
  );
};

const normalizeDraft = (values) => ({
  roles: Array.isArray(values?.roles) ? values.roles : [],
});

export function GroupRolesDialog() {
  const [search, setSearch] = useState("");

  const open = useGroupsStore((state) => state.rolesDialogOpen);
  const group = useGroupsStore((state) => state.groupForRoles);
  const rolesDraft = useGroupsStore((state) => state.rolesDraft);
  const setRolesDraft = useGroupsStore((state) => state.setRolesDraft);
  const closeRolesDialog = useGroupsStore((state) => state.closeRolesDialog);

  const assignRolesMutation = useAssignGroupRolesMutation();
  const rolesQuery = useActiveRolesOptions();

  const roles = rolesQuery.data || [];

  const form = useForm({
    defaultValues: rolesDraft,
    shouldUnregister: false,
  });

  const selectedRoles = form.watch("roles") || [];

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return roles
      .filter((role) => !isSuperAdminRole(role))
      .filter((role) => {
        if (!term) {
          return true;
        }

        return (
          role.name?.toLowerCase().includes(term) ||
          role.code?.toLowerCase().includes(term) ||
          role.description?.toLowerCase().includes(term)
        );
      });
  }, [roles, search]);

  useEffect(() => {
    if (open) {
      form.reset(rolesDraft);
      setSearch("");
    }
  }, [form, open, rolesDraft]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setRolesDraft(normalizeDraft(form.getValues()));
      closeRolesDialog();
    }
  };

  const toggleRole = (roleId, checked) => {
    const currentRoles = form.getValues("roles") || [];

    if (checked) {
      form.setValue("roles", Array.from(new Set([...currentRoles, roleId])), {
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
    if (!group?._id) {
      return;
    }

    assignRolesMutation.mutate({
      groupId: group._id,
      roles: values.roles || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        size="lg"
        className="flex max-h-[90svh] min-h-0 flex-col"
      >
        <AppDialogHeader
          icon={KeyRound}
          title="Manage roles"
          description={
            group
              ? `Select inherited roles for "${group.name}".`
              : "Select inherited roles for this group."
          }
        />

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="shrink-0 border-b bg-background px-4 py-3 sm:px-5">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="feature-search">
                <Search className="feature-search-icon" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search roles..."
                  className="feature-search-input"
                />
              </div>

              <Badge variant="outline" className="h-9 rounded-md px-3">
                {selectedRoles.length} selected
              </Badge>
            </div>
          </div>

          <AppDialogBody scrollable muted className="max-h-[58svh] space-y-2">
            {rolesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton
                    key={`group-role-skeleton-${index}`}
                    className="h-14 rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <Controller
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <div className="space-y-2">
                    {filteredRoles.map((role) => {
                      const checked = field.value.includes(role._id);

                      return (
                        <label
                          key={role._id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-3 py-3 transition-colors",
                            "hover:bg-muted/40",
                            checked && "border-primary/30 bg-primary/5"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              toggleRole(role._id, value === true)
                            }
                          />

                          <span className="min-w-0 flex-1">
                            <span className="table-primary-text font-medium">
                              {role.name}
                            </span>

                            <span className="mt-0.5 block table-secondary-text text-xs text-muted-foreground">
                              {role.code || "Role"}
                            </span>
                          </span>

                          {checked ? (
                            <Check className="size-4 shrink-0 text-primary" />
                          ) : null}
                        </label>
                      );
                    })}

                    {!filteredRoles.length ? (
                      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
                        <div>
                          <KeyRound className="mx-auto size-8 text-muted-foreground" />
                          <p className="mt-3 text-sm font-medium">
                            No roles found
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Super Admin role is excluded from groups.
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              />
            )}
          </AppDialogBody>

          <AppDialogFooter>
            <Button type="submit" disabled={assignRolesMutation.isPending}>
              {assignRolesMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
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