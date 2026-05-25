import { ArrowDownAZ, ArrowDownZA } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";

const columns = [
  {
    key: "label",
    label: "Permission",
    sortable: true,
  },
  {
    key: "module",
    label: "Module",
    sortable: true,
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
  },
  {
    key: "description",
    label: "Description",
    sortable: false,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
  },
];

const normalizeText = (value) => {
  return String(value || "").replaceAll("_", " ").replaceAll("-", " ");
};

const getPermissionLabel = (permission) => {
  return permission?.label || permission?.key || "Permission";
};

const getPermissionKey = (permission) => {
  return permission?.key || "-";
};

const getModuleLabel = (permission) => {
  return permission?.groupLabel || permission?.module || "-";
};

const getPermissionStatus = (permission) => {
  return permission?.status || "active";
};

export function PermissionsTable({
  permissions = [],
  sortBy = "module",
  sortOrder = "asc",
  onSort,
}) {
  if (!permissions.length) {
    return (
      <div className="feature-table-empty">
        <EmptyState
          title="No permissions found"
          description="Try a different search term."
        />
      </div>
    );
  }

  return (
    <div className="feature-table-wrap scrollbar-soft">
      <table className="feature-table min-w-[1120px]">
        <thead className="feature-table-head">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="feature-th">
                {column.sortable ? (
                  <button
                    type="button"
                    className="table-sort-button"
                    onClick={() => onSort?.(column.key)}
                  >
                    <span>{column.label}</span>

                    {sortBy === column.key ? (
                      sortOrder === "asc" ? (
                        <ArrowDownAZ className="size-3.5" />
                      ) : (
                        <ArrowDownZA className="size-3.5" />
                      )
                    ) : null}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {permissions.map((permission) => (
            <tr key={permission._id || permission.key}>
              <td className="feature-td">
                <div className="min-w-0">
                  <p className="table-primary-text font-medium">
                    {getPermissionLabel(permission)}
                  </p>

                  <p className="mt-1 table-secondary-text font-mono text-xs text-muted-foreground">
                    {getPermissionKey(permission)}
                  </p>
                </div>
              </td>

              <td className="feature-td">
                <Badge
                  variant="outline"
                  className="max-w-[14rem] rounded-md font-normal"
                >
                  <span className="truncate">
                    {normalizeText(getModuleLabel(permission))}
                  </span>
                </Badge>
              </td>

              <td className="feature-td">
                <span className="table-code-text">
                  {permission.action || "-"}
                </span>
              </td>

              <td className="feature-td">
                {permission.description ? (
                  <p className="table-description-text text-xs leading-5 text-muted-foreground">
                    {permission.description}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>

              <td className="feature-td">
                <StatusBadge status={getPermissionStatus(permission)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}