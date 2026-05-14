import SkeletonBlock, {
  CardListSkeleton,
  FormSkeleton,
  MetricSkeleton,
  PageHeaderSkeleton,
  RowListSkeleton,
  TableRowsSkeleton,
} from "@components/Skeleton";

export function PageShellSkeleton({ children }) {
  return (
    <section className="site-section py-8">
      <div className="site-container">{children}</div>
    </section>
  );
}

export function SearchControlsSkeleton({ columns = "lg:grid-cols-[1fr_180px_140px]" }) {
  return (
    <div className="site-panel border-b border-[var(--site-border)] p-4">
      <div className={`grid gap-3 ${columns}`}>
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
      <div className="mt-3 flex gap-2">
        <SkeletonBlock className="h-9 w-28" />
        <SkeletonBlock className="h-9 w-24" />
      </div>
    </div>
  );
}

export function TablePageSkeleton({
  columns = 5,
  rows = 6,
  maxWidth = "max-w-7xl",
  controlsColumns,
}) {
  return (
    <PageShellSkeleton maxWidth={maxWidth}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <PageHeaderSkeleton />
        <SkeletonBlock className="h-20 w-36" />
      </div>
      <div className="site-border site-card mt-6 overflow-hidden rounded-lg border">
        <SearchControlsSkeleton columns={controlsColumns} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <tbody>
              <TableRowsSkeleton columns={columns} rows={rows} />
            </tbody>
          </table>
        </div>
      </div>
    </PageShellSkeleton>
  );
}

export function ListPageSkeleton({ metrics = 3, rows = 5, maxWidth = "max-w-6xl" }) {
  return (
    <PageShellSkeleton maxWidth={maxWidth}>
      <PageHeaderSkeleton />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricSkeleton count={metrics} />
      </div>
      <div className="site-border site-card mt-6 divide-y divide-[var(--site-border)] overflow-hidden rounded-lg border">
        <RowListSkeleton count={rows} />
      </div>
    </PageShellSkeleton>
  );
}

export function CardGridPageSkeleton({ metrics = 3, cards = 4 }) {
  return (
    <PageShellSkeleton>
      <PageHeaderSkeleton />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricSkeleton count={metrics} />
      </div>
      <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
        <CardListSkeleton count={cards} />
      </div>
    </PageShellSkeleton>
  );
}

export function ProfilePageSkeleton() {
  return (
    <PageShellSkeleton maxWidth="max-w-7xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <PageHeaderSkeleton />
        <SkeletonBlock className="h-10 w-32" />
      </div>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_414px]">
        <div className="site-border site-card rounded-lg border">
          <div className="border-b border-[var(--site-border)] px-4 py-3">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="mt-2 h-3 w-64 max-w-full" />
          </div>
          <FormSkeleton rows={5} />
        </div>
        <div className="site-border site-card self-start rounded-lg border">
          <div className="border-b border-[var(--site-border)] px-4 py-3">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="mt-2 h-3 w-56" />
          </div>
          <FormSkeleton rows={2} />
        </div>
      </div>
    </PageShellSkeleton>
  );
}

export function JobsPageSkeleton() {
  return (
    <section className="site-section py-10">
      <div className="site-container">
        <PageHeaderSkeleton />
        <div className="site-border site-card mt-8 rounded-lg border p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_140px_160px]">
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </div>
        <div className="mt-6 grid items-start gap-4 lg:grid-cols-[280px_1fr]">
          <div className="site-border site-card rounded-lg border p-4">
            <SkeletonBlock className="h-5 w-24" />
            <div className="mt-5 space-y-4">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-24 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <CardListSkeleton count={5} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function JobDetailPageSkeleton() {
  return (
    <PageShellSkeleton maxWidth="max-w-6xl">
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="site-border site-card rounded-lg border p-6">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-4 h-9 w-2/3" />
          <SkeletonBlock className="mt-4 h-4 w-1/2" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricSkeleton count={3} />
          </div>
          <div className="mt-8 space-y-3">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-4 w-4/5" />
          </div>
        </div>
        <div className="site-border site-card self-start rounded-lg border p-5">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="mt-4 h-10 w-full" />
          <SkeletonBlock className="mt-3 h-10 w-full" />
        </div>
      </div>
    </PageShellSkeleton>
  );
}

export function AuthPageSkeleton() {
  return (
    <section className="site-section py-16">
      <div className="site-container grid gap-8 md:grid-cols-[1fr_420px] md:items-start">
        <PageHeaderSkeleton />
        <div className="site-border site-card rounded-lg border p-4">
          <FormSkeleton rows={3} />
          <SkeletonBlock className="mx-4 mb-4 h-10 w-[calc(100%-2rem)]" />
        </div>
      </div>
    </section>
  );
}
