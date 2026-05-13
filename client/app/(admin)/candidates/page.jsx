import { Suspense } from "react";
import { RowListSkeleton } from "@components/Skeleton";
import CandidatesClient from "./CandidatesClient";

export default function CandidatesPage() {
    return (
        <Suspense fallback={<div className="site-border site-card m-6 divide-y divide-[var(--site-border)] overflow-hidden rounded-lg border"><RowListSkeleton count={5} /></div>}>
            <CandidatesClient />
        </Suspense>
    );
}
