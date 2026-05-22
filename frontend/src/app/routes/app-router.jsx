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

const lazyNamed = (importer, exportName) =>
  lazy(() =>
    importer().then((module) => ({
      default: module[exportName] || module.default,
    }))
  );

const LoginPage = lazyNamed(
  () => import("@/features/auth/pages/login-page"),
  "LoginPage"
);

const ForgotPasswordPage = lazyNamed(
  () => import("@/features/auth/pages/forgot-password-page"),
  "ForgotPasswordPage"
);

const ResetPasswordPage = lazyNamed(
  () => import("@/features/auth/pages/reset-password-page"),
  "ResetPasswordPage"
);

const DashboardPage = lazyNamed(
  () => import("@/features/dashboard/pages/dashboard-page"),
  "DashboardPage"
);

const UsersPage = lazyNamed(
  () => import("@/features/users/pages/users-page"),
  "UsersPage"
);

const RolesPage = lazyNamed(
  () => import("@/features/roles/pages/roles-page"),
  "RolesPage"
);

const GroupsPage = lazyNamed(
  () => import("@/features/groups/pages/groups-page"),
  "GroupsPage"
);

const DepartmentsPage = lazyNamed(
  () => import("@/features/departments/pages/departments-page"),
  "DepartmentsPage"
);

const PermissionsPage = lazyNamed(
  () => import("@/features/permissions/pages/permissions-page"),
  "PermissionsPage"
);

const AuditsPage = lazyNamed(
  () => import("@/features/audits/pages/audits-page"),
  "AuditsPage"
);

const ProfilePage = lazyNamed(
  () => import("@/features/profile/pages/profile-page"),
  "ProfilePage"
);

const SettingsPage = lazyNamed(
  () => import("@/features/settings/pages/settings-page"),
  "SettingsPage"
);

const PermissionDeniedPage = lazyNamed(
  () => import("@/features/system/pages/permission-denied-page"),
  "PermissionDeniedPage"
);

const NotFoundPage = lazyNamed(
  () => import("@/features/system/pages/not-found-page"),
  "NotFoundPage"
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
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route
              path={`${appConfig.routes.resetPassword}/:token`}
              element={
                <LazyPage>
                  <ResetPasswordPage />
                </LazyPage>
              }
            />
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
                path={appConfig.routes.profile}
                element={
                  <LazyPage>
                    <ProfilePage />
                  </LazyPage>
                }
              />

              <Route
                path={appConfig.routes.settings}
                element={
                  <LazyPage>
                    <SettingsPage />
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
                element={<PermissionRoute permissions={[PERMISSIONS.GROUP.READ]} />}
              >
                <Route
                  path={appConfig.routes.groups}
                  element={
                    <LazyPage>
                      <GroupsPage />
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