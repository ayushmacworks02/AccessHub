import { Outlet } from "react-router-dom";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-0 h-svh">
            <AppSidebar />
          </div>
        </div>

        <div className="min-w-0">
          <AppHeader />

          <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}