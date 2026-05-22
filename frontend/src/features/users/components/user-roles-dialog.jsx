import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckCheck, KeyRound, Loader2 } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";

import { useUsersStore } from "@/features/users/store/users.store";
import { useAssignUserRolesMutation } from "@/features/users/hooks/use-users";
import { useActiveRolesOptions } from "@/hooks/use-admin-options";
import { cn } from "@/lib/utils";

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
      <DialogContent className="flex max-h-[92svh] min-h-0 flex-col overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3 pr-8">
            <div className="hidden size-9 shrink-0 items-center justify-center rounded-xl border bg-muted sm:flex">
              <KeyRound className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 space-y-1">
              <DialogTitle>Manage user roles</DialogTitle>
              <DialogDescription className="line-clamp-2">
                {user
                  ? `Assign roles for "${user.name}".`
                  : "Assign roles for this user."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="shrink-0 border-b bg-background px-4 py-3 sm:px-6">
            <p className="text-sm text-muted-foreground">
              {selectedRoles.length} selected
            </p>
          </div>

          <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto bg-muted/20 px-3 py-3 sm:px-6 sm:py-4">
            {rolesQuery.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
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
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roles.map((role) => {
                      const checked = field.value.includes(role._id);

                      return (
                        <label
                          key={role._id}
                          className={cn(
                            "group flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-all",
                            "hover:border-foreground/20 hover:bg-muted/40",
                            checked &&
                              "border-primary/30 bg-primary/5 ring-1 ring-primary/15"
                          )}
                        >
                          <Checkbox
                            checked={checked}
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

                            {role.description ? (
                              <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                                {role.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}

                    {!roles.length ? (
                      <div className="col-span-full rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                        No active roles available.
                      </div>
                    ) : null}
                  </div>
                )}
              />
            )}
          </div>

          <DialogFooter className="shrink-0 border-t bg-background px-4 py-4 sm:px-6">
            <div className="flex w-full justify-end">
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
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}