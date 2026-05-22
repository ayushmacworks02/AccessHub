import { Outlet } from "react-router-dom";

import { appConfig } from "@/config/app.config";

export function AuthLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[1fr_520px]">
        <section className="hidden border-r bg-muted/30 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex h-9 items-center rounded-lg border bg-background px-3 text-sm font-semibold shadow-sm">
              {appConfig.name}
            </div>

            <div className="mt-16 max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight">
                Secure access management made simple.
              </h1>

              <p className="text-base leading-7 text-muted-foreground">
                Manage authentication, users, roles, departments, permissions,
                and audit trails with a secure RBAC-first workflow.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Secure cookie-based authentication with refresh token rotation.
          </p>
        </section>

        <section className="flex min-h-svh items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}