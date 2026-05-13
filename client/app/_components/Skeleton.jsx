"use client";

function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`site-skeleton rounded-md ${className}`}
    />
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-9 w-64 max-w-full" />
      <SkeletonBlock className="h-4 w-full max-w-xl" />
    </div>
  );
}

export function MetricSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="site-border site-panel rounded-lg border p-4"
        >
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-3 h-8 w-20" />
        </div>
      ))}
    </>
  );
}

export function CardListSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="site-border site-card rounded-lg border p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="mt-3 h-4 w-1/2" />
            </div>
            <SkeletonBlock className="h-7 w-20 shrink-0" />
          </div>
          <SkeletonBlock className="mt-5 h-4 w-28" />
        </div>
      ))}
    </>
  );
}

export function RowListSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="mt-3 h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-9 w-28" />
          </div>
        </div>
      ))}
    </>
  );
}

export function TableRowsSkeleton({ columns = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-t border-[var(--site-border)]">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="px-4 py-4">
              <SkeletonBlock
                className={columnIndex === 0 ? "h-5 w-40" : "h-5 w-24"}
              />
              {columnIndex === 0 ? (
                <SkeletonBlock className="mt-2 h-3 w-56 max-w-full" />
              ) : null}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function FormSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid gap-4 sm:grid-cols-2">
          <div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-2 h-10 w-full" />
          </div>
          <div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-2 h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonBlock;
