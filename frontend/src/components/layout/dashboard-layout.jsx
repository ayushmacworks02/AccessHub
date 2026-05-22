import { Outlet } from "react-router-dom";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/stores/sidebar.store";

export function DashboardLayout() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);

  const collapseOnContentFocus = () => {
    if (!collapsed) {
      setCollapsed(true);
    }
  };

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
      style={{
        "--sidebar-width": "17rem",
        "--sidebar-width-icon": "4.75rem",
        "--sidebar-width-mobile": "18rem",
      }}
    >
      <div className="flex min-h-svh w-full bg-background text-foreground">
        <AppSidebar />

        <SidebarInset className="min-w-0 bg-background">
          <AppHeader />

          <div
            className="min-h-[calc(100svh-3.5rem)] min-w-0 outline-none"
            tabIndex={-1}
            onPointerDownCapture={collapseOnContentFocus}
            onMouseDownCapture={collapseOnContentFocus}
            onFocusCapture={collapseOnContentFocus}
          >
            <main className="mx-auto w-full max-w-[1480px] min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}