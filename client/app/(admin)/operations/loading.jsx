import {
  MetricSkeleton,
  PageHeaderSkeleton,
  TableRowsSkeleton,
} from "@components/Skeleton";

export default function Loading() {
  return (
    <section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <PageHeaderSkeleton />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricSkeleton count={4} />
        </div>
        <div className="mt-6 site-border site-card overflow-hidden rounded-lg border">
          <div className="site-panel h-16 border-b border-[var(--site-border)]" />
          <table className="w-full border-collapse text-left text-sm">
            <tbody>
              <TableRowsSkeleton columns={4} rows={5} />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
