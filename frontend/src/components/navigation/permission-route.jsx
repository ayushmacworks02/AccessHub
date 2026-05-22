import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { hasAnyPermission } from "@/lib/rbac/permission-utils";
import { appConfig } from "@/config/app.config";

export function PermissionRoute({ permissions = [] }) {
  const user = useAuthStore((state) => state.user);

  if (!hasAnyPermission(user, permissions)) {
    return <Navigate to={appConfig.routes.forbidden} replace />;
  }

  return <Outlet />;
}