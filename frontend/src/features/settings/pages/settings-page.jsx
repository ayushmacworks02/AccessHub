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
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
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
    <div className="feature-page">
      <PageHeader
        title="Settings"
        description="Manage your account security, reset password email preview, and interface preferences."
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="feature-card">
            <CardHeader className="feature-card-header">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-muted-foreground" />
                Password reset
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-4 p-4 sm:p-5">
                <div className="rounded-xl border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted">
                      <Mail className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        Send password reset email
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Generate a reset password email for your own account.
                        In demo mode, the Ethereal email preview link will be
                        shown here.
                      </p>
                    </div>
                  </div>
                </div>

                {forgotPasswordMutation.isPending ? (
                  <Alert>
                    <Loader2 className="size-4 animate-spin" />
                    <AlertTitle>Sending reset email</AlertTitle>
                    <AlertDescription>
                      Please wait while the reset email is generated.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {forgotPasswordMutation.isSuccess ? (
                  <Alert>
                    <Mail className="size-4" />
                    <AlertTitle>Reset request processed</AlertTitle>
                    <AlertDescription>
                      If an active account exists with this email, a password
                      reset link has been generated.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {previewUrl ? (
                  <Alert>
                    <ExternalLink className="size-4" />
                    <AlertTitle>Ethereal preview available</AlertTitle>
                    <AlertDescription>
                      <button
                        type="button"
                        onClick={handleOpenPreview}
                        className="font-medium underline underline-offset-4"
                      >
                        Open reset email preview
                      </button>
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="button"
                  onClick={handleSendOwnResetEmail}
                  disabled={forgotPasswordMutation.isPending || !user?.email}
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
            </CardContent>
          </Card>

          <Card className="feature-card">
            <CardHeader className="feature-card-header">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-muted-foreground" />
                Security note
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-4 sm:p-5">
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-sm font-medium">
                    Reset links are time bound
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Password reset links expire after the configured reset token
                    duration. Once used, old links cannot be reused.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="feature-card">
            <CardHeader className="feature-card-header">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCircle className="size-4 text-muted-foreground" />
                Account
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-3 p-4 sm:p-5">
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Name
                  </p>
                  <p className="mt-1 table-primary-text font-medium">
                    {user?.name || "-"}
                  </p>
                </div>

                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 table-secondary-text font-medium">
                    {user?.email || "-"}
                  </p>
                </div>

                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Account type
                  </p>
                  <p className="mt-1 font-medium">
                    {user?.isSuperAdmin ? "Super Admin" : "Standard User"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card">
            <CardHeader className="feature-card-header">
              <CardTitle className="flex items-center gap-2 text-base">
                {isDark ? (
                  <Moon className="size-4 text-muted-foreground" />
                ) : (
                  <Sun className="size-4 text-muted-foreground" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-4 p-4 sm:p-5">
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-sm font-medium">
                    Current theme: {isDark ? "Dark" : "Light"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Toggle the interface theme for your current browser.
                  </p>
                </div>

                <Button type="button" variant="outline" onClick={toggleTheme}>
                  {isDark ? (
                    <>
                      <Sun className="size-4" />
                      Switch to light mode
                    </>
                  ) : (
                    <>
                      <Moon className="size-4" />
                      Switch to dark mode
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}