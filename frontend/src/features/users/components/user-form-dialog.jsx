import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CheckCheck, Loader2, ShieldCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
import { PasswordInput } from "@/components/forms/password-input";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import {
  createUserFormSchema,
  updateUserFormSchema,
} from "@/features/users/schemas/user.schema";
import { useUsersStore } from "@/features/users/store/users.store";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/features/users/hooks/use-users";
import {
  useActiveDepartmentsOptions,
  useActiveRolesOptions,
} from "@/hooks/use-admin-options";
import { cn } from "@/lib/utils";

const SUPER_ADMIN_CODES = ["SUPER_ADMIN", "SUPERADMIN"];

const isSuperAdminRole = (role) => {
  return (
    Boolean(role?.isSystemRole) ||
    SUPER_ADMIN_CODES.includes(String(role?.code || "").toUpperCase())
  );
};

const normalizeCreateDraft = (values) => ({
  name: values?.name || "",
  email: values?.email || "",
  password: values?.password || "",
  department: values?.department || "none",
  roles: Array.isArray(values?.roles) ? values.roles : [],
  status: values?.status || "active",
});

const normalizeEditDraft = (values) => ({
  name: values?.name || "",
  email: values?.email || "",
  password: values?.password || "",
  department: values?.department || "none",
});

export function UserFormDialog() {
  const open = useUsersStore((state) => state.formDialogOpen);
  const selectedUser = useUsersStore((state) => state.selectedUser);
  const formMode = useUsersStore((state) => state.formMode);
  const createDraft = useUsersStore((state) => state.createDraft);
  const editDraft = useUsersStore((state) => state.editDraft);
  const setCreateDraft = useUsersStore((state) => state.setCreateDraft);
  const setEditDraft = useUsersStore((state) => state.setEditDraft);
  const closeFormDialog = useUsersStore((state) => state.closeFormDialog);

  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const departmentsQuery = useActiveDepartmentsOptions();
  const rolesQuery = useActiveRolesOptions();

  const departments = departmentsQuery.data || [];
  const roles = rolesQuery.data || [];

  const isEditMode = formMode === "edit" && Boolean(selectedUser?._id);
  const defaultValues = isEditMode ? editDraft : createDraft;

  const form = useForm({
    resolver: zodResolver(isEditMode ? updateUserFormSchema : createUserFormSchema),
    defaultValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const selectedRoles = form.watch("roles") || [];

  const superAdminRole = useMemo(() => {
    return roles.find((role) => isSuperAdminRole(role));
  }, [roles]);

  const selectedSuperAdminRole = useMemo(() => {
    if (!superAdminRole?._id) {
      return null;
    }

    return selectedRoles.includes(superAdminRole._id) ? superAdminRole : null;
  }, [selectedRoles, superAdminRole]);

  const hasSelectedSuperAdminRole = Boolean(selectedSuperAdminRole);

  const hasNormalRoleSelected = useMemo(() => {
    return selectedRoles.some((roleId) => {
      const selectedRole = roles.find((role) => role._id === roleId);
      return selectedRole && !isSuperAdminRole(selectedRole);
    });
  }, [roles, selectedRoles]);

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  useEffect(() => {
    if (!open || isEditMode) {
      return;
    }

    if (hasSelectedSuperAdminRole) {
      form.setValue("department", "none", {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [form, hasSelectedSuperAdminRole, isEditMode, open]);

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      const values = form.getValues();

      if (isEditMode) {
        setEditDraft(normalizeEditDraft(values));
      } else {
        setCreateDraft(normalizeCreateDraft(values));
      }

      closeFormDialog();
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

      form.setValue("department", "none", {
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
    if (isEditMode) {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        department: values.department === "none" ? null : values.department,
      };

      if (values.password?.trim()) {
        payload.password = values.password;
      }

      updateUserMutation.mutate({
        userId: selectedUser._id,
        payload,
      });

      return;
    }

    const selectedRoleObjects = roles.filter((role) =>
      values.roles?.includes(role._id)
    );

    const creatingSuperAdmin = selectedRoleObjects.some((role) =>
      isSuperAdminRole(role)
    );

    const payload = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      department:
        creatingSuperAdmin || values.department === "none"
          ? null
          : values.department,
      roles: Array.isArray(values.roles) ? values.roles : [],
      status: values.status,
    };

    createUserMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        size="xl"
        className="flex max-h-[90svh] min-h-0 flex-col"
      >
        <AppDialogHeader
          icon={UserPlus}
          title={isEditMode ? "Edit user" : "Create user"}
          description={
            isEditMode
              ? "Update user identity and department details."
              : "Create a user, assign department, and choose one or more roles."
          }
        />

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <AppDialogBody scrollable className="max-h-[62svh] space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormFieldWrapper
                label="Full name"
                required
                error={form.formState.errors.name?.message}
              >
                <Input
                  placeholder="Demo User"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Email"
                required
                error={form.formState.errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="demo.user@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register("email")}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label={isEditMode ? "New password" : "Temporary password"}
              required={!isEditMode}
              error={form.formState.errors.password?.message}
            >
              <PasswordInput
                placeholder={
                  isEditMode
                    ? "Leave empty to keep current password"
                    : "Create temporary password"
                }
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
            </FormFieldWrapper>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormFieldWrapper
                label="Department"
                error={form.formState.errors.department?.message}
              >
                <Controller
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        departmentsQuery.isLoading ||
                        hasSelectedSuperAdminRole ||
                        selectedUser?.isSuperAdmin
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={Boolean(form.formState.errors.department)}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="none">No department</SelectItem>

                        {departments.map((department) => (
                          <SelectItem
                            key={department._id}
                            value={department._id}
                          >
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {hasSelectedSuperAdminRole ? (
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    Super Admin users do not require department mapping.
                  </p>
                ) : null}
              </FormFieldWrapper>

              {!isEditMode ? (
                <FormFieldWrapper
                  label="Status"
                  required
                  error={form.formState.errors.status?.message}
                >
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={Boolean(form.formState.errors.status)}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="invited">Invited</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormFieldWrapper>
              ) : null}
            </div>

            {!isEditMode ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      Roles <span className="text-destructive">*</span>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Select Super Admin alone, or select one or more normal
                      roles.
                    </p>
                  </div>

                  <Badge variant="outline" className="rounded-lg px-3 py-1">
                    {selectedRoles.length} selected
                  </Badge>
                </div>

                {rolesQuery.isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={`create-user-role-skeleton-${index}`}
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
                          <div className="col-span-full rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                            <p className="text-sm font-medium">
                              No active roles available
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Create or activate roles before assigning users.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  />
                )}

                {form.formState.errors.roles?.message ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.roles.message}
                  </p>
                ) : null}

                {hasSelectedSuperAdminRole ? (
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                    Super Admin has full access. Other roles are not required
                    and cannot be combined with Super Admin.
                  </div>
                ) : null}
              </div>
            ) : null}
          </AppDialogBody>

          <AppDialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditMode ? (
                "Save changes"
              ) : (
                "Create user"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}