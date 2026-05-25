import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Loader2,
  MailCheck,
  RotateCcw,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/components/common/app-dialog-shell";
import { useUsersStore } from "@/features/users/store/users.store";

const getRemainingText = (expiresAt, now) => {
  if (!expiresAt || !now) {
    return "";
  }

  const remainingMs = new Date(expiresAt).getTime() - now;

  if (remainingMs <= 0) {
    return "Expired";
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s left`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s left`;
};

export function UserEmailPreviewDialog() {
  const [now, setNow] = useState(0);

  const emailPreviewDialog = useUsersStore((state) => state.emailPreviewDialog);
  const hideEmailPreviewDialog = useUsersStore(
    (state) => state.hideEmailPreviewDialog
  );
  const reopenEmailPreviewDialog = useUsersStore(
    (state) => state.reopenEmailPreviewDialog
  );
  const clearEmailPreviewDialog = useUsersStore(
    (state) => state.clearEmailPreviewDialog
  );

  const isSending = emailPreviewDialog.status === "sending";
  const isError = emailPreviewDialog.status === "error";

  const remainingMs =
    emailPreviewDialog.expiresAt && now
      ? new Date(emailPreviewDialog.expiresAt).getTime() - now
      : 0;

  const canRecoverPreview =
    !emailPreviewDialog.open &&
    emailPreviewDialog.recoverable &&
    Boolean(emailPreviewDialog.previewUrl) &&
    remainingMs > 0;

  const remainingText = useMemo(
    () => getRemainingText(emailPreviewDialog.expiresAt, now),
    [emailPreviewDialog.expiresAt, now]
  );

  const HeaderIcon = isError ? TriangleAlert : isSending ? Loader2 : MailCheck;

  useEffect(() => {
    if (!emailPreviewDialog.expiresAt) {
      return undefined;
    }

    const firstTickId = window.setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(firstTickId);
      window.clearInterval(intervalId);
    };
  }, [emailPreviewDialog.expiresAt]);

  useEffect(() => {
    if (
      !now ||
      !emailPreviewDialog.recoverable ||
      !emailPreviewDialog.expiresAt ||
      remainingMs > 0
    ) {
      return undefined;
    }

    const cleanupId = window.setTimeout(() => {
      clearEmailPreviewDialog();
    }, 0);

    return () => window.clearTimeout(cleanupId);
  }, [
    clearEmailPreviewDialog,
    emailPreviewDialog.expiresAt,
    emailPreviewDialog.recoverable,
    now,
    remainingMs,
  ]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && isSending) {
      return;
    }

    if (!nextOpen) {
      hideEmailPreviewDialog();
    }
  };

  const preventCloseWhileSending = (event) => {
    if (isSending) {
      event.preventDefault();
    }
  };

  const openPreview = () => {
    if (!emailPreviewDialog.previewUrl) {
      return;
    }

    window.open(emailPreviewDialog.previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {canRecoverPreview ? (
        <div className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border bg-background p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
              <MailCheck className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                Reset email preview available
              </p>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                The preview link is still available. You can reopen it before
                the reset link expires.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={reopenEmailPreviewDialog}
                >
                  <RotateCcw className="size-4" />
                  Show dialog
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openPreview}
                >
                  <ExternalLink className="size-4" />
                  Open preview
                </Button>
              </div>

              {remainingText ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TimerReset className="size-3.5" />
                  {remainingText}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={emailPreviewDialog.open} onOpenChange={handleOpenChange}>
        <AppDialogContent
          size="md"
          showCloseButton={!isSending}
          onEscapeKeyDown={preventCloseWhileSending}
          onInteractOutside={preventCloseWhileSending}
        >
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
                    <p className="text-sm font-medium">
                      Sending reset email...
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Please wait while the reset link is generated and the demo
                      email preview is prepared. This dialog will stay open
                      until the request is completed.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {!isSending && emailPreviewDialog.previewUrl ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Ethereal preview URL
                  </p>

                  {remainingText ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground">
                      <TimerReset className="size-3.5" />
                      {remainingText}
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 table-description-text break-all text-sm leading-6">
                  {emailPreviewDialog.previewUrl}
                </p>
              </div>
            ) : null}

            {!isSending && !isError && !emailPreviewDialog.previewUrl ? (
              <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                Email was sent, but no preview URL was returned. Preview URLs
                are usually available only in development or demo mode.
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
    </>
  );
}