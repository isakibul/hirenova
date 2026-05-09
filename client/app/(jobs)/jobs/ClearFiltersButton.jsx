"use client";
export default function ClearFiltersButton() {
    return (<button type="button" onClick={() => {
            window.location.assign("/jobs");
        }} className="site-border site-field rounded-md border px-3 py-2 text-sm font-semibold">
      Clear Filter
    </button>);
}
