import { useQuery } from "@tanstack/react-query";

import { departmentsApi } from "@/features/departments/api/departments.api";
import { rolesApi } from "@/features/roles/api/roles.api";

export const ADMIN_OPTIONS_QUERY_KEYS = {
  activeDepartments: ["admin-options", "active-departments"],
  activeRoles: ["admin-options", "active-roles"],
};

export function useActiveDepartmentsOptions() {
  return useQuery({
    queryKey: ADMIN_OPTIONS_QUERY_KEYS.activeDepartments,
    queryFn: () =>
      departmentsApi.getDepartments({
        status: "active",
        limit: 100,
        page: 1,
        sortBy: "name",
        sortOrder: "asc",
      }),
    select: (data) => data?.departments || [],
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveRolesOptions() {
  return useQuery({
    queryKey: ADMIN_OPTIONS_QUERY_KEYS.activeRoles,
    queryFn: () =>
      rolesApi.getRoles({
        status: "active",
        limit: 100,
        page: 1,
        sortBy: "name",
        sortOrder: "asc",
      }),
    select: (data) => data?.roles || [],
    staleTime: 5 * 60 * 1000,
  });
}