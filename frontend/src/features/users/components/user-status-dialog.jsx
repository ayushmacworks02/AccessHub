import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, UserRoundCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { userStatusFormSchema } from "@/features/users/schemas/user.schema";
import { useUsersStore } from "@/features/users/store/users.store";
import { useUpdateUserStatusMutation } from "@/features/users/hooks/use-users";

const normalizeStatusDraft = (values) => ({
  status: values?.status || "active",
});

export function UserStatusDialog() {
  const open = useUsersStore((state) => state.statusDialogOpen);
  const user = useUsersStore((state) => state.userForStatus);
  const statusDraft = useUsersStore((state) => state.statusDraft);
  const setStatusDraft = useUsersStore((state) => state.setStatusDraft);
  const closeStatusDialog = useUsersStore((state) => state.closeStatusDialog);

  const updateStatusMutation = useUpdateUserStatusMutation();

  const form = useForm({
    resolver: zodResolver(userStatusFormSchema),
    defaultValues: statusDraft,
    mode: "onTouched",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (open) {
      form.reset(statusDraft);
    }
  }, [form, open, statusDraft]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setStatusDraft(normalizeStatusDraft(form.getValues()));
      closeStatusDialog();
    }
  };

  const onSubmit = (values) => {
    if (!user?._id) {
      return;
    }

    updateStatusMutation.mutate({
      userId: user._id,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AppDialogContent size="sm">
        <AppDialogHeader
          icon={UserRoundCog}
          title="Change user status"
          description={
            user
              ? `Update account status for "${user.name}".`
              : "Update account status for this user."
          }
        />

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AppDialogBody className="space-y-5">
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
          </AppDialogBody>

          <AppDialogFooter>
            <Button type="submit" disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update status"
              )}
            </Button>
          </AppDialogFooter>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}