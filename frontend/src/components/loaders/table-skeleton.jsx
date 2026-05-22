import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`table-skeleton-row-${rowIndex}`}
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <Skeleton
                key={`table-skeleton-cell-${rowIndex}-${columnIndex}`}
                className="h-8 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}