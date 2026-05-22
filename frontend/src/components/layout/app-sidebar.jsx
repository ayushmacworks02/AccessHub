import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  UserCircle,
} from "lucide-react";

import { appNavigationRoutes } from "@/routes/routes";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth";
import { hasAnyPermission } from "@/lib/rbac/permission-utils";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getInitials = (name = "", email = "") => {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getReadableRole = (user) => {
  if (user?.isSuperAdmin) {
    return "Super Admin";
  }

  if (Array.isArray(user?.roles) && user.roles.length) {
    return user.roles[0]?.name || "Standard User";
  }

  return "Standard User";
};

const getNavigationGroup = (routeTitle = "") => {
  const title = routeTitle.toLowerCase();

  if (
    title.includes("user") ||
    title.includes("role") ||
    title.includes("group") ||
    title.includes("permission") ||
    title.includes("department")
  ) {
    return "Access management";
  }

  if (title.includes("audit")) {
    return "Monitoring";
  }

  return "Workspace";
};

const groupRoutes = (routes = []) => {
  const groups = {
    Workspace: [],
    "Access management": [],
    Monitoring: [],
  };

  routes.forEach((route) => {
    const group = getNavigationGroup(route.title);
    groups[group].push(route);
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
};

export function AppSidebar() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const visibleRoutes = appNavigationRoutes.filter((route) =>
    hasAnyPermission(user, route.permissions)
  );

  const groupedRoutes = groupRoutes(visibleRoutes);

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMobileSidebar();
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border p-3 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={appConfig.name}
              onClick={() => handleNavigate(appConfig.routes.dashboard)}
              className={cn(
                "h-12 rounded-2xl px-3",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "group-data-[collapsible=icon]:mx-auto",
                "group-data-[collapsible=icon]:size-11",
                "group-data-[collapsible=icon]:justify-center",
                "group-data-[collapsible=icon]:p-0"
              )}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <Shield className="size-4" />
              </div>

              <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">
                  {appConfig.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Auth & RBAC Console
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-2">
        {groupedRoutes.map(([groupName, routes]) => (
          <SidebarGroup
            key={groupName}
            className="px-1 py-1 group-data-[collapsible=icon]:px-0"
          >
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 group-data-[collapsible=icon]:sr-only">
              {groupName}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {routes.map((route) => {
                  const Icon = route.icon || LayoutDashboard;

                  return (
                    <SidebarMenuItem key={route.path}>
                      <NavLink to={route.path} onClick={closeMobileSidebar}>
                        {({ isActive }) => (
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={route.title}
                            className={cn(
                              "h-10 rounded-xl px-3 text-sm font-medium",
                              "transition-colors duration-150",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              "data-[active=true]:bg-sidebar-accent",
                              "data-[active=true]:text-sidebar-accent-foreground",
                              "data-[active=true]:shadow-sm",
                              "group-data-[collapsible=icon]:mx-auto",
                              "group-data-[collapsible=icon]:size-10",
                              "group-data-[collapsible=icon]:justify-center",
                              "group-data-[collapsible=icon]:p-0"
                            )}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {route.title}
                            </span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user?.name || user?.email || "Account"}
                  className={cn(
                    "h-12 rounded-2xl px-3",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "data-[state=open]:bg-sidebar-accent",
                    "data-[state=open]:text-sidebar-accent-foreground",
                    "group-data-[collapsible=icon]:mx-auto",
                    "group-data-[collapsible=icon]:size-11",
                    "group-data-[collapsible=icon]:justify-center",
                    "group-data-[collapsible=icon]:p-0"
                  )}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background text-xs font-semibold uppercase text-foreground">
                    {getInitials(user?.name, user?.email)}
                  </div>

                  <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium">
                      {user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {getReadableRole(user)}
                    </span>
                  </div>

                  <ChevronRight className="ml-auto size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side={isMobile || !isCollapsed ? "bottom" : "right"}
                align={isMobile || !isCollapsed ? "end" : "center"}
                sideOffset={12}
                className="w-64 rounded-xl"
              >
                <DropdownMenuLabel>
                  <div className="space-y-1">
                    <p className="truncate text-sm font-medium">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    handleNavigate(appConfig.routes.profile);
                  }}
                >
                  <UserCircle className="size-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    handleNavigate(appConfig.routes.settings);
                  }}
                >
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  disabled={logoutMutation.isPending}
                  onSelect={(event) => {
                    event.preventDefault();
                    logoutMutation.mutate();
                  }}
                >
                  <LogOut className="size-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}