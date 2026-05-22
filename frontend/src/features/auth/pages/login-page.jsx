import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PasswordInput } from "@/components/forms/password-input";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { loginFormSchema } from "@/features/auth/schemas/auth.schema";
import { useLoginMutation } from "@/features/auth/hooks/use-auth";
import { appConfig } from "@/config/app.config";

export function LoginPage() {
  const loginMutation = useLoginMutation();

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (values) => {
    loginMutation.mutate(values);
  };

  return (
    <Card className="w-full border-border/80 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="inline-flex h-9 w-fit items-center rounded-lg border bg-muted px-3 text-sm font-semibold lg:hidden">
          {appConfig.name}
        </div>

        <CardTitle className="text-xl sm:text-2xl">Sign in</CardTitle>

        <CardDescription>
          Enter your credentials to access the admin console.
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

          <FormFieldWrapper
            label="Password"
            required
            error={form.formState.errors.password?.message}
          >
            <PasswordInput
              placeholder="Enter password"
              autoComplete="current-password"
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register("password")}
            />
          </FormFieldWrapper>

          <div className="flex items-center justify-end">
            <Link
              to={appConfig.routes.forgotPassword}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}