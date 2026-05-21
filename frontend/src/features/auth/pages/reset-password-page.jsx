import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { PasswordInput } from "@/components/forms/password-input";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { resetPasswordFormSchema } from "@/features/auth/schemas/auth.schema";
import { useResetPasswordMutation } from "@/features/auth/hooks/use-auth";
import { appConfig } from "@/config/app.config";

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const resetPasswordMutation = useResetPasswordMutation();

  const form = useForm({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (values) => {
    resetPasswordMutation.mutate({
      token,
      payload: values,
    });
  };

  const hasToken = token.trim().length > 0;

  return (
    <Card className="w-full border-border/80 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="inline-flex h-9 w-fit items-center rounded-lg border bg-muted px-3 text-sm font-semibold lg:hidden">
          AccessHub
        </div>

        <CardTitle className="text-xl sm:text-2xl">
          Reset password
        </CardTitle>

        <CardDescription>
          Create a new secure password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!hasToken ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Invalid reset link</AlertTitle>
              <AlertDescription>
                The reset token is missing. Please request a new password reset
                link.
              </AlertDescription>
            </Alert>

            <Button variant="outline" className="w-full gap-2" asChild>
              <Link to={appConfig.routes.forgotPassword}>
                Request new reset link
              </Link>
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Alert>
              <ShieldCheck className="size-4" />
              <AlertTitle>Password rules</AlertTitle>
              <AlertDescription>
                Use at least 8 characters with uppercase, lowercase, number, and
                special character.
              </AlertDescription>
            </Alert>

            <FormFieldWrapper
              label="New password"
              required
              error={form.formState.errors.password?.message}
            >
              <PasswordInput
                placeholder="Enter new password"
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Confirm password"
              required
              error={form.formState.errors.confirmPassword?.message}
            >
              <PasswordInput
                placeholder="Confirm new password"
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                {...form.register("confirmPassword")}
              />
            </FormFieldWrapper>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2"
              asChild
            >
              <Link to={appConfig.routes.login}>
                <ArrowLeft className="size-4" />
                Back to login
              </Link>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}