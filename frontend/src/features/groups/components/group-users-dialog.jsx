import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, UserPlus } from "lucide-react";

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
import { useAssignGroupUsersMutation } from "@/features/groups/hooks/use-groups";
import { usersApi } from "@/features/users/api/users.api";
import { cn } from "@/lib/utils";

const normalizeDraft = (values) => ({
  users: Array.isArray(values?.users) ? values.users : [],
});

const getDepartmentLabel = (user) => {
  if (!user?.department) {
    return "No department";
  }

  return user.department.name || user.department.code || "Department";
};

export function GroupUsersDialog() {
  const [search, setSearch] = useState("");

  const open = useGroupsStore((state) => state.usersDialogOpen);
  const group = useGroupsStore((state) => state.groupForUsers);
  const usersDraft = useGroupsStore((state) => state.usersDraft);
  const setUsersDraft = useGroupsStore((state) => state.setUsersDraft);
  const closeUsersDialog = useGroupsStore((state) => state.closeUsersDialog);

  const assignUsersMutation = useAssignGroupUsersMutation();

  const form = useForm({
    defaultValues: usersDraft,
    shouldUnregister: false,
  });

  const selectedUsers = form.watch("users") || [];

  const usersQuery = useQuery({
    queryKey: ["groups", "assignable-users"],
    queryFn: () =>
      usersApi.getUsers({
        search: "",
        status: "active",
        department: "all",
        role: "all",
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      }),
    enabled: open,
  });

  const users = usersQuery.data?.users || [];

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users
      .filter((user) => !user.isSuperAdmin)
      .filter((user) => {
        if (!term) {
          return true;
        }

        return (
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.department?.name?.toLowerCase().includes(term) ||
          user.department?.code?.toLowerCase().includes(term)
        );
      });
  }, [search, users]);

  useEffect(() => {
    if (open) {
      form.reset(usersDraft);
      setSearch("");
    }
  }, [form, open, usersDraft]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setUsersDraft(normalizeDraft(form.getValues()));
      closeUsersDialog();
    }
  };

  const toggleUser = (userId, checked) => {
    const currentUsers = form.getValues("users") || [];

    if (checked) {
      form.setValue("users", Array.from(new Set([...currentUsers, userId])), {
        shouldDirty: true,
        shouldTouch: true,
      });

      return;
    }

    form.setValue(
      "users",
      currentUsers.filter((id) => id !== userId),
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

    assignUsersMutation.mutate({
      groupId: group._id,
      users: values.users || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        size="lg"
        className="flex max-h-[90svh] min-h-0 flex-col"
      >
        <AppDialogHeader
          icon={UserPlus}
          title="Manage users"
          description={
            group
              ? `Select users for "${group.name}".`
              : "Select users for this group."
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
                  placeholder="Search users..."
                  className="feature-search-input"
                />
              </div>

              <Badge variant="outline" className="h-9 rounded-md px-3">
                {selectedUsers.length} selected
              </Badge>
            </div>
          </div>

          <AppDialogBody scrollable muted className="max-h-[58svh] space-y-2">
            {usersQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton
                    key={`group-user-skeleton-${index}`}
                    className="h-14 rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <Controller
                control={form.control}
                name="users"
                render={({ field }) => (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => {
                      const checked = field.value.includes(user._id);

                      return (
                        <label
                          key={user._id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-3 py-3 transition-colors",
                            "hover:bg-muted/40",
                            checked && "border-primary/30 bg-primary/5"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              toggleUser(user._id, value === true)
                            }
                          />

                          <span className="min-w-0 flex-1">
                            <span className="table-primary-text font-medium">
                              {user.name}
                            </span>

                            <span className="mt-0.5 block table-secondary-text text-xs text-muted-foreground">
                              {user.email} · {getDepartmentLabel(user)}
                            </span>
                          </span>

                          {checked ? (
                            <Check className="size-4 shrink-0 text-primary" />
                          ) : null}
                        </label>
                      );
                    })}

                    {!filteredUsers.length ? (
                      <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
                        <div>
                          <UserPlus className="mx-auto size-8 text-muted-foreground" />
                          <p className="mt-3 text-sm font-medium">
                            No users found
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Try a different search term.
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
            <Button type="submit" disabled={assignUsersMutation.isPending}>
              {assignUsersMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save users"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}