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

  if (audit?.actorName) {
    return audit.actorName;
  }

  if (audit?.actorEmail) {
    return audit.actorEmail;
  }

  return "System";
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
      <div className="p-6">
        <EmptyState
          title="No audit logs found"
          description="Audit events will appear here when users perform important actions."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b bg-background text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.sortable ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
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

            <th className="w-16 px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {audits.map((audit) => (
            <tr key={audit._id} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <Badge variant="outline" className="rounded-md capitalize">
                  {humanizeText(audit.action)}
                </Badge>
              </td>

              <td className="px-4 py-3">
                <div className="flex min-w-0 items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0">
                    <p className="table-primary-text font-medium capitalize">
                      {humanizeText(getResourceLabel(audit))}
                    </p>

                    {audit.resourceId || audit.entityId ? (
                      <p className="mt-1 table-secondary-text font-mono text-xs text-muted-foreground">
                        {audit.resourceId || audit.entityId}
                      </p>
                    ) : null}

                    {audit.description ? (
                      <p className="mt-1 table-description-text text-xs leading-5 text-muted-foreground">
                        {audit.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="min-w-0">
                  <p className="table-primary-text font-medium">
                    {getActorLabel(audit)}
                  </p>

                  {audit.ipAddress ? (
                    <p className="mt-1 table-meta-text text-xs text-muted-foreground">
                      {audit.ipAddress}
                    </p>
                  ) : null}
                </div>
              </td>

              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDateTime(audit.createdAt)}
              </td>

              <td className="px-4 py-3 text-right">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-8">
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