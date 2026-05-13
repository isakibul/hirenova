import { TablePageSkeleton } from "@components/PageSkeletons";

export default function Loading() {
  return (
    <TablePageSkeleton
      columns={3}
      rows={5}
      maxWidth="max-w-6xl"
      controlsColumns="lg:grid-cols-[1fr_180px_190px_140px]"
    />
  );
}
