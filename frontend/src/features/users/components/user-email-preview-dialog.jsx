import { ExternalLink, Loader2, MailCheck, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
import { useUsersStore } from "@/features/users/store/users.store";

export function UserEmailPreviewDialog() {
  const emailPreviewDialog = useUsersStore((state) => state.emailPreviewDialog);
  const closeEmailPreviewDialog = useUsersStore(
    (state) => state.closeEmailPreviewDialog
  );

  const isSending = emailPreviewDialog.status === "sending";
  const isError = emailPreviewDialog.status === "error";

  const HeaderIcon = isError ? TriangleAlert : isSending ? Loader2 : MailCheck;

  const openPreview = () => {
    if (!emailPreviewDialog.previewUrl) {
      return;
    }

    window.open(emailPreviewDialog.previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog
      open={emailPreviewDialog.open}
      onOpenChange={closeEmailPreviewDialog}
    >
      <AppDialogContent size="md">
        <AppDialogHeader
          icon={HeaderIcon}
          title={emailPreviewDialog.title}
          description={emailPreviewDialog.description}
          iconClassName={isSending ? "animate-spin" : ""}
        />

        <AppDialogBody className="space-y-4">
          {isSending ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">Sending reset email...</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Please wait while the reset link is generated and the demo
                    email preview is prepared.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {!isSending && emailPreviewDialog.previewUrl ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ethereal preview URL
              </p>

              <p className="mt-2 table-description-text break-all text-sm leading-6">
                {emailPreviewDialog.previewUrl}
              </p>
            </div>
          ) : null}

          {!isSending && !isError && !emailPreviewDialog.previewUrl ? (
            <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              Email was sent, but no preview URL was returned. Preview URLs are
              usually available only in development or demo mode.
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-6 text-destructive">
              {emailPreviewDialog.description ||
                "Unable to send reset email. Please try again."}
            </div>
          ) : null}

          {!isSending && emailPreviewDialog.messageId ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Message ID
              </p>

              <p className="mt-2 table-description-text break-all font-mono text-xs leading-6">
                {emailPreviewDialog.messageId}
              </p>
            </div>
          ) : null}
        </AppDialogBody>

        <AppDialogFooter>
          <Button
            type="button"
            onClick={openPreview}
            disabled={isSending || isError || !emailPreviewDialog.previewUrl}
          >
            <ExternalLink className="size-4" />
            Open email preview
          </Button>
        </AppDialogFooter>
      </AppDialogContent>
    </Dialog>
  );
}