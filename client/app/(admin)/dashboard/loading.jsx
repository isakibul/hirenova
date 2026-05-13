import { PageHeaderSkeleton, MetricSkeleton, CardListSkeleton } from "@components/Skeleton";

export default function Loading() {
  return (
    <section className="px-5 py-8 md:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <PageHeaderSkeleton />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricSkeleton count={4} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CardListSkeleton count={4} />
        </div>
      </div>
    </section>
  );
}
