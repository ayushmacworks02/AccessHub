import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { appConfig } from "@/config/app.config";

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={appConfig.routes.login}
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}