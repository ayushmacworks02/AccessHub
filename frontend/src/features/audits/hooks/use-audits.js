import { useQuery } from "@tanstack/react-query";

import { auditsApi } from "@/features/audits/api/audits.api";
import { useAuditsStore } from "@/features/audits/store/audits.store";
import { useDebounce } from "@/hooks/use-debounce";

export const AUDITS_QUERY_KEYS = {
  all: ["audits"],
  list: (params) => ["audits", "list", params],
  detail: (auditId) => ["audits", "detail", auditId],
};

export function useAuditsQuery() {
  const search = useAuditsStore((state) => state.search);
  const action = useAuditsStore((state) => state.action);
  const resource = useAuditsStore((state) => state.resource);
  const page = useAuditsStore((state) => state.page);
  const limit = useAuditsStore((state) => state.limit);
  const sortBy = useAuditsStore((state) => state.sortBy);
  const sortOrder = useAuditsStore((state) => state.sortOrder);

  const debouncedSearch = useDebounce(search, 400);

  const params = {
    search: debouncedSearch,
    action,
    resource,
    page,
    limit,
    sortBy,
    sortOrder,
  };

  return useQuery({
    queryKey: AUDITS_QUERY_KEYS.list(params),
    queryFn: () => auditsApi.getAudits(params),
    select: (data) => ({
      audits: data?.audits || [],
      pagination: data?.pagination || {
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      filters: data?.filters || {},
    }),
  });
}