import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Building2, Loader2 } from "lucide-react";

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
import { departmentFormSchema } from "@/features/departments/schemas/department.schema";
import { useDepartmentsStore } from "@/features/departments/store/departments.store";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/features/departments/hooks/use-departments";

const normalizeDepartmentDraft = (values) => ({
  name: values?.name || "",
  code: values?.code || "",
  description: values?.description || "",
  status: values?.status || "active",
});

export function DepartmentFormDialog() {
  const open = useDepartmentsStore((state) => state.formDialogOpen);
  const selectedDepartment = useDepartmentsStore(
    (state) => state.selectedDepartment
  );
  const formDraft = useDepartmentsStore((state) => state.formDraft);
  const setFormDraft = useDepartmentsStore((state) => state.setFormDraft);
  const closeFormDialog = useDepartmentsStore((state) => state.closeFormDialog);

  const createDepartmentMutation = useCreateDepartmentMutation();
  const updateDepartmentMutation = useUpdateDepartmentMutation();

  const isEditMode = Boolean(selectedDepartment?._id);

  const form = useForm({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: formDraft,
    mode: "onTouched",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (open) {
      form.reset(formDraft);
    }
  }, [form, formDraft, open]);

  const isPending =
    createDepartmentMutation.isPending || updateDepartmentMutation.isPending;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setFormDraft(normalizeDepartmentDraft(form.getValues()));
      closeFormDialog();
    }
  };

  const onSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description?.trim() || "",
      status: values.status,
    };

    if (isEditMode) {
      updateDepartmentMutation.mutate({
        departmentId: selectedDepartment._id,
        payload,
      });
      return;
    }

    createDepartmentMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent size="md">
        <AppDialogHeader
          icon={Building2}
          title={isEditMode ? "Edit department" : "Create department"}
          description={
            isEditMode
              ? "Update department details and availability."
              : "Create a department for organizing users and roles."
          }
        />

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AppDialogBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormFieldWrapper
                label="Department name"
                required
                error={form.formState.errors.name?.message}
              >
                <Input
                  placeholder="Information Security"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Department code"
                required
                error={form.formState.errors.code?.message}
              >
                <Input
                  placeholder="INFOSEC"
                  aria-invalid={Boolean(form.formState.errors.code)}
                  {...form.register("code")}
                  onInput={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.toUpperCase();
                  }}
                />
              </FormFieldWrapper>
            </div>

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
                    </SelectContent>
                  </Select>
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Textarea
                placeholder="Short description about this department"
                className="min-h-28 resize-none"
                aria-invalid={Boolean(form.formState.errors.description)}
                {...form.register("description")}
              />
            </FormFieldWrapper>
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
                "Create department"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}