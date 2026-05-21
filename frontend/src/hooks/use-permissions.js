import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/rbac/permission-utils";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    can: (permission) => hasPermission(user, permission),
    canAny: (permissions) => hasAnyPermission(user, permissions),
    canAll: (permissions) => hasAllPermissions(user, permissions),
  };
}