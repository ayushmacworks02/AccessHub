import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, UsersRound } from "lucide-react";

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
import { useGroupsStore } from "@/features/groups/store/groups.store";
import { groupFormSchema } from "@/features/groups/schemas/group.schema";
import {
  useCreateGroupMutation,
  useUpdateGroupMutation,
} from "@/features/groups/hooks/use-groups";

const normalizeDraft = (values) => ({
  name: values?.name || "",
  code: values?.code || "",
  description: values?.description || "",
  status: values?.status || "active",
});

export function GroupFormDialog() {
  const open = useGroupsStore((state) => state.formDialogOpen);
  const formMode = useGroupsStore((state) => state.formMode);
  const selectedGroup = useGroupsStore((state) => state.selectedGroup);
  const createDraft = useGroupsStore((state) => state.createDraft);
  const editDraft = useGroupsStore((state) => state.editDraft);

  const setCreateDraft = useGroupsStore((state) => state.setCreateDraft);
  const setEditDraft = useGroupsStore((state) => state.setEditDraft);
  const closeFormDialog = useGroupsStore((state) => state.closeFormDialog);

  const createGroupMutation = useCreateGroupMutation();
  const updateGroupMutation = useUpdateGroupMutation();

  const isEditMode = formMode === "edit" && Boolean(selectedGroup?._id);
  const defaultValues = isEditMode ? editDraft : createDraft;

  const form = useForm({
    resolver: zodResolver(groupFormSchema),
    defaultValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const isPending =
    createGroupMutation.isPending || updateGroupMutation.isPending;

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      const values = normalizeDraft(form.getValues());

      if (isEditMode) {
        setEditDraft(values);
      } else {
        setCreateDraft(values);
      }

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
      updateGroupMutation.mutate({
        groupId: selectedGroup._id,
        payload,
      });

      return;
    }

    createGroupMutation.mutate({
      ...payload,
      users: [],
      roles: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent
        size="md"
        className="flex max-h-[88svh] min-h-0 flex-col"
      >
        <AppDialogHeader
          icon={UsersRound}
          title={isEditMode ? "Edit group" : "Create group"}
          description={
            isEditMode
              ? "Update group details."
              : "Create a group for shared access."
          }
        />

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <AppDialogBody scrollable className="max-h-[58svh] space-y-4">
            <FormFieldWrapper
              label="Group name"
              required
              error={form.formState.errors.name?.message}
            >
              <Input
                placeholder="Internal Audit Team"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Group code"
              required
              error={form.formState.errors.code?.message}
            >
              <Input
                placeholder="INTERNAL_AUDIT"
                aria-invalid={Boolean(form.formState.errors.code)}
                {...form.register("code")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Textarea
                placeholder="Optional short description."
                className="min-h-24 resize-none"
                aria-invalid={Boolean(form.formState.errors.description)}
                {...form.register("description")}
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
                "Create group"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}