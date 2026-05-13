import { ListPageSkeleton } from "@components/PageSkeletons";

export default function Loading() {
  return <ListPageSkeleton metrics={0} rows={6} maxWidth="max-w-5xl" />;
}
