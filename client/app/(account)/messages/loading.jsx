import SkeletonBlock, { RowListSkeleton } from "@components/Skeleton";

export default function Loading() {
  return (
    <section className="px-5 py-8 md:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <div className="grid h-[calc(100vh-5.5rem)] min-h-[620px] gap-4 lg:grid-cols-[340px_1fr]">
          <aside className="site-border site-card overflow-hidden rounded-lg border">
            <div className="site-panel border-b border-[var(--site-border)] px-4 py-3">
              <SkeletonBlock className="h-5 w-32" />
            </div>
            <RowListSkeleton count={6} />
          </aside>
          <div className="site-border site-card rounded-lg border p-5">
            <SkeletonBlock className="h-6 w-48" />
            <div className="mt-8 space-y-4">
              <SkeletonBlock className="h-16 w-3/4" />
              <SkeletonBlock className="ml-auto h-16 w-2/3" />
              <SkeletonBlock className="h-16 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
