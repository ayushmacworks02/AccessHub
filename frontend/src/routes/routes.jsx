import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { PERMISSIONS } from "@/lib/rbac/permissions";

export const appNavigationRoutes = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    permissions: [],
  },
  {
    title: "Users",
    path: "/users",
    icon: Users,
    permissions: [PERMISSIONS.USER.READ],
  },
  {
    title: "Roles",
    path: "/roles",
    icon: ShieldCheck,
    permissions: [PERMISSIONS.ROLE.READ],
  },
  {
    title: "Departments",
    path: "/departments",
    icon: Building2,
    permissions: [PERMISSIONS.DEPARTMENT.READ],
  },
  {
    title: "Permissions",
    path: "/permissions",
    icon: UserCog,
    permissions: [PERMISSIONS.PERMISSION.READ],
  },
  {
    title: "Audit Logs",
    path: "/audits",
    icon: ClipboardList,
    permissions: [PERMISSIONS.AUDIT.READ],
  },
];