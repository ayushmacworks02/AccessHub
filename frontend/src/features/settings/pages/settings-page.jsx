import {
  ExternalLink,
  KeyRound,
  Loader2,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserCircle,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth";
import { useThemeStore } from "@/stores/theme.store";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isDark = theme === "dark";
  const previewUrl = forgotPasswordMutation.data?.previewUrl || "";

  const handleSendOwnResetEmail = () => {
    if (!user?.email) {
      return;
    }

    forgotPasswordMutation.mutate({
      email: user.email,
    });
  };

  const handleOpenPreview = () => {
    if (!previewUrl) {
      return;
    }

    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account security, reset password email preview, and interface preferences."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-muted-foreground" />
                Password reset
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      Send reset password email to my account
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      A reset password link will be sent to your registered
                      email address. In demo mode, the Ethereal preview URL will
                      appear below.
                    </p>

                    <div className="mt-4">
                      <Button
                        type="button"
                        onClick={handleSendOwnResetEmail}
                        disabled={
                          forgotPasswordMutation.isPending || !user?.email
                        }
                      >
                        {forgotPasswordMutation.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Sending reset email...
                          </>
                        ) : (
                          <>
                            <Mail className="size-4" />
                            Send reset email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {forgotPasswordMutation.isSuccess ? (
                <Alert>
                  <ShieldCheck className="size-4" />
                  <AlertTitle>Reset request processed</AlertTitle>
                  <AlertDescription>
                    If your account is active, a password reset email has been
                    generated for {user?.email}.
                  </AlertDescription>
                </Alert>
              ) : null}

              {previewUrl ? (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Ethereal preview URL
                  </p>

                  <p className="mt-2 break-all text-sm leading-6">
                    {previewUrl}
                  </p>

                  <Button
                    type="button"
                    className="mt-4"
                    onClick={handleOpenPreview}
                  >
                    <ExternalLink className="size-4" />
                    Open email preview
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                {isDark ? (
                  <Moon className="size-4 text-muted-foreground" />
                ) : (
                  <Sun className="size-4 text-muted-foreground" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Current theme is {isDark ? "dark" : "light"} mode.
                  </p>
                </div>

                <Button type="button" variant="outline" onClick={toggleTheme}>
                  {isDark ? (
                    <>
                      <Sun className="size-4" />
                      Switch to light
                    </>
                  ) : (
                    <>
                      <Moon className="size-4" />
                      Switch to dark
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-border/80">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="size-4 text-muted-foreground" />
              Account summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 p-4 sm:p-6">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="mt-1 text-sm font-medium">{user?.name || "-"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-1 break-all text-sm font-medium">
                {user?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Account type</p>
              <p className="mt-1 text-sm font-medium">
                {user?.isSuperAdmin ? "Super Admin" : "Standard User"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-medium">
                {user?.status || "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}