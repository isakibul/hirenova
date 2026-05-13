import { TablePageSkeleton } from "@components/PageSkeletons";

export default function Loading() {
  return (
    <TablePageSkeleton
      columns={5}
      rows={6}
      controlsColumns="lg:grid-cols-[1fr_180px_140px]"
    />
  );
}
