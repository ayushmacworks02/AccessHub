import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthLayout } from "@/components/layout/auth-layout";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProtectedRoute } from "@/components/navigation/protected-route";
import { PublicRoute } from "@/components/navigation/public-route";
import { PermissionRoute } from "@/components/navigation/permission-route";
import { PageLoader } from "@/components/loaders/page-loader";
import { RouteLoader } from "@/components/loaders/route-loader";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { appConfig } from "@/config/app.config";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/login-page").then((module) => ({
    default: module.LoginPage,
  }))
);

const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/pages/forgot-password-page").then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);

const ResetPasswordPage = lazy(() =>
  import("@/features/auth/pages/reset-password-page").then((module) => ({
    default: module.ResetPasswordPage,
  }))
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  }))
);

const UsersPage = lazy(() =>
  import("@/features/users/pages/users-page").then((module) => ({
    default: module.UsersPage,
  }))
);

const RolesPage = lazy(() =>
  import("@/features/roles/pages/roles-page").then((module) => ({
    default: module.RolesPage,
  }))
);

const DepartmentsPage = lazy(() =>
  import("@/features/departments/pages/departments-page").then((module) => ({
    default: module.DepartmentsPage,
  }))
);

const PermissionsPage = lazy(() =>
  import("@/features/permissions/pages/permissions-page").then((module) => ({
    default: module.PermissionsPage,
  }))
);

const AuditsPage = lazy(() =>
  import("@/features/audits/pages/audits-page").then((module) => ({
    default: module.AuditsPage,
  }))
);

const PermissionDeniedPage = lazy(() =>
  import("@/features/system/pages/permission-denied-page").then((module) => ({
    default: module.PermissionDeniedPage,
  }))
);

const NotFoundPage = lazy(() =>
  import("@/features/system/pages/not-found-page").then((module) => ({
    default: module.NotFoundPage,
  }))
);

function AuthBootstrap({ children }) {
  const query = useCurrentUserQuery();

  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (query.isSuccess) {
      setUser(query.data || null);
      return;
    }

    if (query.isError) {
      clearUser();
    }
  }, [query.isSuccess, query.isError, query.data, setUser, clearUser]);

  if (query.isPending || !isAuthReady) {
    return <PageLoader label="Preparing your workspace..." />;
  }

  return children;
}

function LazyPage({ children }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route
                path={appConfig.routes.login}
                element={
                  <LazyPage>
                    <LoginPage />
                  </LazyPage>
                }
              />

              <Route
                path={appConfig.routes.forgotPassword}
                element={
                  <LazyPage>
                    <ForgotPasswordPage />
                  </LazyPage>
                }
              />

              <Route
                path={`${appConfig.routes.resetPassword}/:token`}
                element={
                  <LazyPage>
                    <ResetPasswordPage />
                  </LazyPage>
                }
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route
                path={appConfig.routes.dashboard}
                element={
                  <LazyPage>
                    <DashboardPage />
                  </LazyPage>
                }
              />

              <Route
                element={<PermissionRoute permissions={[PERMISSIONS.USER.READ]} />}
              >
                <Route
                  path={appConfig.routes.users}
                  element={
                    <LazyPage>
                      <UsersPage />
                    </LazyPage>
                  }
                />
              </Route>

              <Route
                element={<PermissionRoute permissions={[PERMISSIONS.ROLE.READ]} />}
              >
                <Route
                  path={appConfig.routes.roles}
                  element={
                    <LazyPage>
                      <RolesPage />
                    </LazyPage>
                  }
                />
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
                  element={
                    <LazyPage>
                      <DepartmentsPage />
                    </LazyPage>
                  }
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
                  path={appConfig.routes.permissions}
                  element={
                    <LazyPage>
                      <PermissionsPage />
                    </LazyPage>
                  }
                />
              </Route>

              <Route
                element={<PermissionRoute permissions={[PERMISSIONS.AUDIT.READ]} />}
              >
                <Route
                  path={appConfig.routes.audits}
                  element={
                    <LazyPage>
                      <AuditsPage />
                    </LazyPage>
                  }
                />
              </Route>

              <Route
                path={appConfig.routes.forbidden}
                element={
                  <LazyPage>
                    <PermissionDeniedPage />
                  </LazyPage>
                }
              />

              <Route
                path={appConfig.routes.notFound}
                element={
                  <LazyPage>
                    <NotFoundPage />
                  </LazyPage>
                }
              />
            </Route>
          </Route>

          <Route
            path="/"
            element={<Navigate to={appConfig.routes.dashboard} replace />}
          />

          <Route
            path="*"
            element={<Navigate to={appConfig.routes.notFound} replace />}
          />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}