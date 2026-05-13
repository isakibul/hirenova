import { Suspense } from "react";
import CandidatesClient from "./CandidatesClient";

export default function CandidatesPage() {
    return (
        <Suspense fallback={<div className="site-muted p-6 text-sm">Loading candidates...</div>}>
            <CandidatesClient />
        </Suspense>
    );
}
