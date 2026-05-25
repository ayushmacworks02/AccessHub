import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { appNavigationRoutes } from "@/routes/routes";
import { appConfig } from "@/config/app.config";

const normalizePath = (path = "") => {
  if (!path || path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
};

const getActiveRoute = (pathname) => {
  const currentPath = normalizePath(pathname);

  return appNavigationRoutes.find((route) => {
    const routePath = normalizePath(route.path);

    return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
  });
};

export function AppHeader() {
  const location = useLocation();

  const activeRoute = useMemo(
    () => getActiveRoute(location.pathname),
    [location.pathname]
  );

  const pageTitle = activeRoute?.title || appConfig.name;

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b bg-background/92 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-5 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger
          className="inline-flex size-9 rounded-xl lg:hidden"
          aria-label="Open sidebar"
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {pageTitle}
          </p>

          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {appConfig.name}
          </p>
        </div>
      </div>
    </header>
  );
}