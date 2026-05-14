import { PageHeaderSkeleton, CardListSkeleton } from "@components/Skeleton";

export default function Loading() {
  return (
    <section className="site-section py-8">
      <div className="site-container">
        <PageHeaderSkeleton />
        <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
          <CardListSkeleton count={4} />
        </div>
      </div>
    </section>
  );
}
