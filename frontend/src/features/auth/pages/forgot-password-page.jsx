import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, ExternalLink, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { forgotPasswordFormSchema } from "@/features/auth/schemas/auth.schema";
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth";
import { appConfig } from "@/config/app.config";

export function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (values) => {
    forgotPasswordMutation.mutate(values);
  };

  const previewUrl = forgotPasswordMutation.data?.previewUrl || "";

  return (
    <Card className="w-full border-border/80 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="inline-flex h-9 w-fit items-center rounded-lg border bg-muted px-3 text-sm font-semibold lg:hidden">
          AccessHub
        </div>

        <CardTitle className="text-xl sm:text-2xl">
          Forgot password?
        </CardTitle>

        <CardDescription>
          Enter your registered email address and we will send a password reset
          link if the account is active.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormFieldWrapper
            label="Email"
            required
            error={form.formState.errors.email?.message}
          >
            <Input
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
          </FormFieldWrapper>

          {forgotPasswordMutation.isSuccess ? (
            <Alert>
              <Mail className="size-4" />
              <AlertTitle>Reset request processed</AlertTitle>
              <AlertDescription>
                If an active account exists with this email, a password reset
                link has been generated.
              </AlertDescription>
            </Alert>
          ) : null}

          {previewUrl ? (
            <Alert>
              <ExternalLink className="size-4" />
              <AlertTitle>Ethereal preview available</AlertTitle>
              <AlertDescription>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  Open reset email preview
                </a>
              </AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
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
      </CardContent>
    </Card>
  );
}