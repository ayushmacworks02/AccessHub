import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

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
import { PasswordInput } from "@/components/forms/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const isLoadingOptions = departmentsQuery.isLoading || rolesQuery.isLoading;

  const isEditMode = formMode === "edit";
  const activeDraft = isEditMode ? editDraft : createDraft;

  const form = useForm({
    resolver: zodResolver(isEditMode ? updateUserFormSchema : createUserFormSchema),
    defaultValues: activeDraft,
    mode: "onTouched",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (open) {
      form.reset(activeDraft);
    }
  }, [activeDraft, form, open]);

  const selectedRoles = form.watch("roles") || [];
  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      if (isEditMode) {
        setEditDraft(normalizeEditDraft(form.getValues()));
      } else {
        setCreateDraft(normalizeCreateDraft(form.getValues()));
      }

      closeFormDialog();
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

    const payload = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      department: values.department === "none" ? null : values.department,
      roles: values.roles || [],
      status: values.status,
    };

    createUserMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>
            {isEditMode ? "Edit user" : "Create user"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update user profile and department details."
              : "Create a new user and optionally assign department and roles."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5 px-4 py-4 sm:px-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper
              label="Full name"
              required
              error={form.formState.errors.name?.message}
            >
              <Input
                placeholder="John Doe"
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
                placeholder="john@example.com"
                autoComplete="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper
            label={isEditMode ? "New password" : "Password"}
            required={!isEditMode}
            error={form.formState.errors.password?.message}
          >
            <PasswordInput
              placeholder={
                isEditMode
                  ? "Leave blank to keep current password"
                  : "Create secure password"
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
                    disabled={departmentsQuery.isLoading}
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
                        <SelectItem key={department._id} value={department._id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
            <FormFieldWrapper
              label="Roles"
              error={form.formState.errors.roles?.message}
            >
              <div className="rounded-xl border bg-muted/20 p-3">
                {isLoadingOptions ? (
                  <p className="text-sm text-muted-foreground">
                    Loading roles...
                  </p>
                ) : roles.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roles.map((role) => {
                      const checked = selectedRoles.includes(role._id);

                      return (
                        <label
                          key={role._id}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/40"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              toggleRole(role._id, value === true)
                            }
                            className="mt-0.5"
                          />

                          <span className="min-w-0">
                            <span className="block text-sm font-medium">
                              {role.name}
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
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No active roles available.
                  </p>
                )}
              </div>
            </FormFieldWrapper>
          ) : null}

          <DialogFooter className="-mx-4 -mb-4 border-t px-4 py-4 sm:-mx-6 sm:px-6">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}