import { NavLink } from "react-router-dom";
import { Shield } from "lucide-react";

import { appNavigationRoutes } from "@/routes/routes";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { hasAnyPermission } from "@/lib/rbac/permission-utils";
import { cn } from "@/lib/utils";

export function AppSidebar({ onNavigate }) {
  const user = useAuthStore((state) => state.user);

  const visibleRoutes = appNavigationRoutes.filter((route) =>
    hasAnyPermission(user, route.permissions)
  );

  return (
    <aside className="flex h-full w-full flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Shield className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-none">
            AccessHub
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            RBAC Console
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleRoutes.map((route) => {
          const Icon = route.icon;

          return (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground"
                )
              }
            >
              <Icon className="size-4" />
              <span>{route.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="rounded-lg bg-sidebar-accent/70 p-3">
          <p className="truncate text-sm font-medium">
            {user?.name || "User"}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {user?.email || ""}
          </p>
        </div>
      </div>
    </aside>
  );
}