import { PageHeaderSkeleton, CardListSkeleton } from "@components/Skeleton";

export default function Loading() {
  return (
    <section className="px-5 py-8 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <PageHeaderSkeleton />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <CardListSkeleton count={4} />
        </div>
      </div>
    </section>
  );
}
