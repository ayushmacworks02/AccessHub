import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <DialogContent className="p-0 sm:max-w-md">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>Change user status</DialogTitle>
          <DialogDescription>
            {user
              ? `Update account status for "${user.name}".`
              : "Update account status for this user."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5 px-4 py-4 sm:px-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
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

          <DialogFooter className="-mx-4 -mb-4 border-t px-4 py-4 sm:-mx-6 sm:px-6">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}