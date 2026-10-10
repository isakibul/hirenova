import { TablePageSkeleton } from "@components/PageSkeletons";

export default function Loading() {
  return (
    <TablePageSkeleton
      columns={6}
      rows={6}
      controlsColumns="lg:grid-cols-[1fr_170px_170px_170px_140px]"
    />
  );
}
