import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { roleFormSchema } from "@/features/roles/schemas/role.schema";
import { useRolesStore } from "@/features/roles/store/roles.store";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/features/roles/hooks/use-roles";
import { useActiveDepartmentsOptions } from "@/hooks/use-admin-options";

const normalizeRoleDraft = (values) => ({
  name: values?.name || "",
  code: values?.code || "",
  description: values?.description || "",
  department: values?.department || "none",
  status: values?.status || "active",
  permissions: Array.isArray(values?.permissions) ? values.permissions : [],
});

export function RoleFormDialog() {
  const open = useRolesStore((state) => state.formDialogOpen);
  const selectedRole = useRolesStore((state) => state.selectedRole);
  const formDraft = useRolesStore((state) => state.formDraft);
  const setFormDraft = useRolesStore((state) => state.setFormDraft);
  const closeFormDialog = useRolesStore((state) => state.closeFormDialog);

  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const departmentsQuery = useActiveDepartmentsOptions();

  const departments = departmentsQuery.data || [];
  const isEditMode = Boolean(selectedRole?._id);
  const isSystemRole = Boolean(selectedRole?.isSystemRole);

  const form = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: formDraft,
    mode: "onTouched",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (open) {
      form.reset(formDraft);
    }
  }, [form, formDraft, open]);

  const isPending = createRoleMutation.isPending || updateRoleMutation.isPending;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setFormDraft(normalizeRoleDraft(form.getValues()));
      closeFormDialog();
    }
  };

  const onSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description?.trim() || "",
      department: values.department === "none" ? null : values.department,
      status: values.status,
    };

    if (!isEditMode) {
      payload.permissions = Array.isArray(values.permissions)
        ? values.permissions
        : [];
    }

    if (isEditMode) {
      updateRoleMutation.mutate({
        roleId: selectedRole._id,
        payload,
      });
      return;
    }

    createRoleMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent size="lg">
        <AppDialogHeader
          icon={ShieldCheck}
          title={isEditMode ? "Edit role" : "Create role"}
          description={
            isEditMode
              ? "Update role details, department, and status."
              : "Create a reusable role. Permissions can be assigned later."
          }
        />

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AppDialogBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormFieldWrapper
                label="Role name"
                required
                error={form.formState.errors.name?.message}
              >
                <Input
                  placeholder="Security Analyst"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Role code"
                required
                error={form.formState.errors.code?.message}
              >
                <Input
                  placeholder="SECURITY_ANALYST"
                  disabled={isSystemRole}
                  aria-invalid={Boolean(form.formState.errors.code)}
                  {...form.register("code")}
                  onInput={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.toUpperCase();
                  }}
                />
              </FormFieldWrapper>
            </div>

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
                      disabled={isSystemRole || departmentsQuery.isLoading}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={Boolean(form.formState.errors.department)}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="none">Global role</SelectItem>

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
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Status"
                required
                error={form.formState.errors.status?.message}
              >
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSystemRole}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={Boolean(form.formState.errors.status)}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Textarea
                placeholder="Short description about this role"
                className="min-h-28 resize-none"
                aria-invalid={Boolean(form.formState.errors.description)}
                {...form.register("description")}
              />
            </FormFieldWrapper>

            {isSystemRole ? (
              <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                This is a system role. Code, status, and department are
                protected.
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
                "Create role"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}