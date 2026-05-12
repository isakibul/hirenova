export default function PaginationControls({
  currentPage,
  totalPages,
  isLoading = false,
  onPageChange,
}) {
  const page = currentPage ?? 1;
  const lastPage = Math.max(totalPages ?? 1, 1);

  return (
    <div className="site-panel flex flex-col gap-3 border-t border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="site-muted text-xs">
        Page {page} of {lastPage}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1 || isLoading}
          className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, lastPage))}
          disabled={page >= lastPage || isLoading}
          className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
