import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { departmentsApi } from "@/features/departments/api/departments.api";
import { useDepartmentsStore } from "@/features/departments/store/departments.store";
import { getApiErrorMessage } from "@/lib/api/api-response";
import { queryClient } from "@/lib/query/query-client";
import { useDebounce } from "@/hooks/use-debounce";

export const DEPARTMENTS_QUERY_KEYS = {
  all: ["departments"],
  list: (params) => ["departments", "list", params],
  detail: (departmentId) => ["departments", "detail", departmentId],
};

export function useDepartmentsQuery() {
  const search = useDepartmentsStore((state) => state.search);
  const status = useDepartmentsStore((state) => state.status);
  const page = useDepartmentsStore((state) => state.page);
  const limit = useDepartmentsStore((state) => state.limit);
  const sortBy = useDepartmentsStore((state) => state.sortBy);
  const sortOrder = useDepartmentsStore((state) => state.sortOrder);

  const debouncedSearch = useDebounce(search, 400);

  const params = {
    search: debouncedSearch,
    status,
    page,
    limit,
    sortBy,
    sortOrder,
  };

  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEYS.list(params),
    queryFn: () => departmentsApi.getDepartments(params),
    select: (data) => ({
      departments: data?.departments || [],
      pagination: data?.pagination || {
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
  });
}
export function useCreateDepartmentMutation() {
  const resetAndCloseFormDialog = useDepartmentsStore(
    (state) => state.resetAndCloseFormDialog
  );

  return useMutation({
    mutationFn: departmentsApi.createDepartment,
    onSuccess: () => {
      toast.success("Department created successfully");
      resetAndCloseFormDialog();
      queryClient.invalidateQueries({
        queryKey: DEPARTMENTS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create department"));
    },
  });
}

export function useUpdateDepartmentMutation() {
  const resetAndCloseFormDialog = useDepartmentsStore(
    (state) => state.resetAndCloseFormDialog
  );

  return useMutation({
    mutationFn: departmentsApi.updateDepartment,
    onSuccess: () => {
      toast.success("Department updated successfully");
      resetAndCloseFormDialog();
      queryClient.invalidateQueries({
        queryKey: DEPARTMENTS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update department"));
    },
  });
}

export function useDeleteDepartmentMutation() {
  const closeDeleteDialog = useDepartmentsStore(
    (state) => state.closeDeleteDialog
  );

  return useMutation({
    mutationFn: departmentsApi.deleteDepartment,
    onSuccess: () => {
      toast.success("Department deleted successfully");
      closeDeleteDialog();
      queryClient.invalidateQueries({
        queryKey: DEPARTMENTS_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete department"));
    },
  });
}