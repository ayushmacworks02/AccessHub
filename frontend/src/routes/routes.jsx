import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { appConfig } from "@/config/app.config";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const appNavigationRoutes = [
  {
    title: "Dashboard",
    path: appConfig.routes.dashboard,
    icon: LayoutDashboard,
    permissions: [],
  },
  {
    title: "Users",
    path: appConfig.routes.users,
    icon: Users,
    permissions: [PERMISSIONS.USER.READ],
  },
  {
    title: "Roles",
    path: appConfig.routes.roles,
    icon: ShieldCheck,
    permissions: [PERMISSIONS.ROLE.READ],
  },
  {
    title: "Departments",
    path: appConfig.routes.departments,
    icon: Building2,
    permissions: [PERMISSIONS.DEPARTMENT.READ],
  },
  {
    title: "Permissions",
    path: appConfig.routes.permissions,
    icon: UserCog,
    permissions: [PERMISSIONS.PERMISSION.READ],
  },
  {
    title: "Audit Logs",
    path: appConfig.routes.audits,
    icon: ClipboardList,
    permissions: [PERMISSIONS.AUDIT.READ],
  },
];