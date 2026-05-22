import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PaginationControls({
  pagination,
  limit,
  onPageChange,
  onLimitChange,
}) {
  const page = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;
  const hasPreviousPage = Boolean(pagination?.hasPreviousPage);
  const hasNextPage = Boolean(pagination?.hasNextPage);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
        {" · "}
        <span className="font-medium text-foreground">{total}</span> total
      </p>

      <div className="flex items-center gap-2">
        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10 rows</SelectItem>
            <SelectItem value="20">20 rows</SelectItem>
            <SelectItem value="50">50 rows</SelectItem>
            <SelectItem value="100">100 rows</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}