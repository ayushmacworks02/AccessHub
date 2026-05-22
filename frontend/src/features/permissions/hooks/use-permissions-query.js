import { useQuery } from "@tanstack/react-query";
import { permissionsApi } from "@/features/permissions/api/permissions.api";

export const PERMISSIONS_QUERY_KEYS = {
  all: ["permissions"],
  grouped: ["permissions", "grouped"],
  flat: ["permissions", "flat"],
};

export function useGroupedPermissionsQuery() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.grouped,
    queryFn: () =>
      permissionsApi.getPermissions({
        grouped: true,
      }),
    select: (data) => data?.permissions || [],
  });
}

export function useFlatPermissionsQuery() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.flat,
    queryFn: () =>
      permissionsApi.getPermissions({
        grouped: false,
      }),
    select: (data) => data?.permissions || [],
  });
}