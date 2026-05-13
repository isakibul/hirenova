import { ListPageSkeleton } from "@components/PageSkeletons";

export default function Loading() {
  return <ListPageSkeleton metrics={1} rows={6} maxWidth="max-w-6xl" />;
}
