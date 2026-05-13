"use client";

import { Suspense } from "react";
import { RowListSkeleton } from "@components/Skeleton";
import MessagesClient from "./MessagesClient";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="site-border site-card m-6 divide-y divide-[var(--site-border)] overflow-hidden rounded-lg border"><RowListSkeleton count={6} /></div>}>
      <MessagesClient />
    </Suspense>
  );
}
