"use client";
import { useRouter } from "next/navigation";
export default function ClearFiltersButton() {
    const router = useRouter();
    return (<button type="button" onClick={() => {
            router.push("/jobs");
        }} className="site-border site-field rounded-md border px-3 py-2 text-sm font-semibold">
      Clear Filter
    </button>);
}
