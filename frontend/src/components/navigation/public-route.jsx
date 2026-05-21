import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { appConfig } from "@/config/app.config";

export function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={appConfig.routes.dashboard} replace />;
  }

  return <Outlet />;
}