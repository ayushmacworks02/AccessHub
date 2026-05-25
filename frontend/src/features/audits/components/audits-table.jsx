import {
  ArrowDownAZ,
  ArrowDownZA,
  Eye,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { formatDateTime } from "@/lib/utils/format-date";
import { useAuditsStore } from "@/features/audits/store/audits.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columns = [
  {
    key: "action",
    label: "Action",
    sortable: true,
  },
  {
    key: "resource",
    label: "Resource",
    sortable: true,
  },
  {
    key: "description",
    label: "Description",
    sortable: false,
  },
  {
    key: "actor",
    label: "Actor",
    sortable: false,
  },
  {
    key: "createdAt",
    label: "Time",
    sortable: true,
  },
];

const humanizeText = (value) => {
  if (!value) {
    return "-";
  }

  return String(value).replaceAll("_", " ").replaceAll("-", " ");
};

const getActorLabel = (audit) => {
  if (audit?.actor?.name) {
    return audit.actor.name;
  }

  if (audit?.actor?.email) {
    return audit.actor.email;
  }

  if (audit?.actorSnapshot?.name) {
    return audit.actorSnapshot.name;
  }

  if (audit?.actorSnapshot?.email) {
    return audit.actorSnapshot.email;
  }

  if (audit?.actorName) {
    return audit.actorName;
  }

  if (audit?.actorEmail) {
    return audit.actorEmail;
  }

  return "System";
};

const getActorEmail = (audit) => {
  return audit?.actor?.email || audit?.actorSnapshot?.email || "";
};

const getResourceLabel = (audit) => {
  return audit?.resource || audit?.module || audit?.entityType || "-";
};

export function AuditsTable({ audits = [] }) {
  const sortBy = useAuditsStore((state) => state.sortBy);
  const sortOrder = useAuditsStore((state) => state.sortOrder);
  const setSorting = useAuditsStore((state) => state.setSorting);
  const openDetailDialog = useAuditsStore((state) => state.openDetailDialog);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSorting({
        sortBy: columnKey,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      });

      return;
    }

    setSorting({
      sortBy: columnKey,
      sortOrder: "asc",
    });
  };

  if (!audits.length) {
    return (
      <div className="feature-table-empty">
        <EmptyState
          title="No audit logs found"
          description="Audit events will appear here when users perform important actions."
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
                    onClick={() => handleSort(column.key)}
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

            <th className="feature-th table-action-cell">Actions</th>
          </tr>
        </thead>

        <tbody>
          {audits.map((audit) => (
            <tr key={audit._id}>
              <td className="feature-td">
                <Badge variant="outline" className="rounded-md capitalize">
                  {humanizeText(audit.action)}
                </Badge>
              </td>

              <td className="feature-td">
                <div className="flex min-w-0 items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0">
                    <p className="table-primary-text font-medium capitalize">
                      {humanizeText(getResourceLabel(audit))}
                    </p>

                    {audit.entityId || audit.resourceId ? (
                      <p className="mt-1 table-secondary-text font-mono text-xs text-muted-foreground">
                        {audit.entityId || audit.resourceId}
                      </p>
                    ) : null}
                  </div>
                </div>
              </td>

              <td className="feature-td">
                {audit.description ? (
                  <p className="table-description-text text-xs leading-5 text-muted-foreground">
                    {audit.description}
                  </p>
                ) : audit.errorMessage ? (
                  <p className="table-description-text text-xs leading-5 text-destructive">
                    {audit.errorMessage}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>

              <td className="feature-td">
                <div className="min-w-0">
                  <p className="table-primary-text font-medium">
                    {getActorLabel(audit)}
                  </p>

                  {getActorEmail(audit) ? (
                    <p className="mt-1 table-secondary-text text-xs text-muted-foreground">
                      {getActorEmail(audit)}
                    </p>
                  ) : null}

                  {audit.request?.ipAddress || audit.ipAddress ? (
                    <p className="mt-1 table-meta-text text-xs text-muted-foreground">
                      {audit.request?.ipAddress || audit.ipAddress}
                    </p>
                  ) : null}
                </div>
              </td>

              <td className="feature-td text-sm text-muted-foreground">
                {formatDateTime(audit.createdAt)}
              </td>

              <td className="feature-td table-action-cell">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open actions</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        openDetailDialog(audit);
                      }}
                    >
                      <Eye className="size-4" />
                      View details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}