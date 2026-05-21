import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthLayout } from "@/components/layout/auth-layout";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProtectedRoute } from "@/components/navigation/protected-route";
import { PublicRoute } from "@/components/navigation/public-route";
import { PermissionRoute } from "@/components/navigation/permission-route";
import { PageLoader } from "@/components/loaders/page-loader";

import { LoginPage } from "@/features/auth/pages/login-page";
import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password-page";
import { ResetPasswordPage } from "@/features/auth/pages/reset-password-page";

import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { UsersPage } from "@/features/users/pages/users-page";
import { RolesPage } from "@/features/roles/pages/roles-page";
import { DepartmentsPage } from "@/features/departments/pages/departments-page";
import { PermissionsPage } from "@/features/permissions/pages/permissions-page";
import { AuditsPage } from "@/features/audits/pages/audits-page";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { appConfig } from "@/config/app.config";

function AuthBootstrap({ children }) {
  const query = useCurrentUserQuery();

  if (query.isLoading || query.isFetching) {
    return <PageLoader label="Preparing your workspace..." />;
  }

  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path={appConfig.routes.login} element={<LoginPage />} />

              <Route
                path={appConfig.routes.forgotPassword}
                element={<ForgotPasswordPage />}
              />

              <Route
                path={`${appConfig.routes.resetPassword}/:token`}
                element={<ResetPasswordPage />}
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route
                path={appConfig.routes.dashboard}
                element={<DashboardPage />}
              />

              <Route
                element={<PermissionRoute permissions={[PERMISSIONS.USER.READ]} />}
              >
                <Route path={appConfig.routes.users} element={<UsersPage />} />
              </Route>

              <Route
                element={<PermissionRoute permissions={[PERMISSIONS.ROLE.READ]} />}
              >
                <Route path={appConfig.routes.roles} element={<RolesPage />} />
              </Route>

              <Route
                element={
                  <PermissionRoute
                    permissions={[PERMISSIONS.DEPARTMENT.READ]}
                  />
                }
              >
                <Route
                  path={appConfig.routes.departments}
                  element={<DepartmentsPage />}
                />
              </Route>

              <Route
                element={
                  <PermissionRoute
                    permissions={[PERMISSIONS.PERMISSION.READ]}
                  />
                }
              >
                <Route
                  path="/permissions"
                  element={<PermissionsPage />}
                />
              </Route>

              <Route
                element={<PermissionRoute permissions={[PERMISSIONS.AUDIT.READ]} />}
              >
                <Route path={appConfig.routes.audits} element={<AuditsPage />} />
              </Route>
            </Route>
          </Route>

          <Route
            path="/"
            element={<Navigate to={appConfig.routes.dashboard} replace />}
          />

          <Route
            path="*"
            element={<Navigate to={appConfig.routes.dashboard} replace />}
          />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}