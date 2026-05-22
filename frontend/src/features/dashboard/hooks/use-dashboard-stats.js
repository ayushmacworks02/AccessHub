import { useQuery } from "@tanstack/react-query";

import { auditsApi } from "@/features/audits/api/audits.api";
import { departmentsApi } from "@/features/departments/api/departments.api";
import { groupsApi } from "@/features/groups/api/groups.api";
import { rolesApi } from "@/features/roles/api/roles.api";
import { usersApi } from "@/features/users/api/users.api";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/rbac/permissions";

const DASHBOARD_QUERY_KEYS = {
  users: ["dashboard", "users-count"],
  roles: ["dashboard", "roles-count"],
  groups: ["dashboard", "groups-count"],
  departments: ["dashboard", "departments-count"],
  audits: ["dashboard", "audits-count"],
};

const safeTotal = (data) => {
  return Number(data?.pagination?.total || 0);
};

export function useDashboardStats() {
  const { can } = usePermissions();

  const canReadUsers = can(PERMISSIONS.USER.READ);
  const canReadRoles = can(PERMISSIONS.ROLE.READ);
  const canReadGroups = can(PERMISSIONS.GROUP.READ);
  const canReadDepartments = can(PERMISSIONS.DEPARTMENT.READ);
  const canReadAudits = can(PERMISSIONS.AUDIT.READ);

  const usersQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.users,
    queryFn: () =>
      usersApi.getUsers({
        page: 1,
        limit: 1,
        status: "all",
        department: "all",
        role: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: canReadUsers,
    select: safeTotal,
  });

  const rolesQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.roles,
    queryFn: () =>
      rolesApi.getRoles({
        page: 1,
        limit: 1,
        status: "all",
        department: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: canReadRoles,
    select: safeTotal,
  });

  const groupsQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.groups,
    queryFn: () =>
      groupsApi.getGroups({
        page: 1,
        limit: 1,
        status: "all",
        user: "all",
        role: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: canReadGroups,
    select: safeTotal,
  });

  const departmentsQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.departments,
    queryFn: () =>
      departmentsApi.getDepartments({
        page: 1,
        limit: 1,
        status: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: canReadDepartments,
    select: safeTotal,
  });

  const auditsQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.audits,
    queryFn: () =>
      auditsApi.getAudits({
        page: 1,
        limit: 1,
        action: "all",
        module: "all",
        status: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    enabled: canReadAudits,
    select: safeTotal,
  });

  const isLoading =
    usersQuery.isLoading ||
    rolesQuery.isLoading ||
    groupsQuery.isLoading ||
    departmentsQuery.isLoading ||
    auditsQuery.isLoading;

  const isError =
    usersQuery.isError ||
    rolesQuery.isError ||
    groupsQuery.isError ||
    departmentsQuery.isError ||
    auditsQuery.isError;

  return {
    isLoading,
    isError,

    users: {
      enabled: canReadUsers,
      total: usersQuery.data || 0,
      refetch: usersQuery.refetch,
    },

    roles: {
      enabled: canReadRoles,
      total: rolesQuery.data || 0,
      refetch: rolesQuery.refetch,
    },

    groups: {
      enabled: canReadGroups,
      total: groupsQuery.data || 0,
      refetch: groupsQuery.refetch,
    },

    departments: {
      enabled: canReadDepartments,
      total: departmentsQuery.data || 0,
      refetch: departmentsQuery.refetch,
    },

    audits: {
      enabled: canReadAudits,
      total: auditsQuery.data || 0,
      refetch: auditsQuery.refetch,
    },

    refetchAll: () => {
      if (canReadUsers) usersQuery.refetch();
      if (canReadRoles) rolesQuery.refetch();
      if (canReadGroups) groupsQuery.refetch();
      if (canReadDepartments) departmentsQuery.refetch();
      if (canReadAudits) auditsQuery.refetch();
    },
  };
}