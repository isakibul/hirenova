export default function PaginationControls({
  currentPage,
  totalPages,
  isLoading = false,
  onPageChange,
}) {
  const page = Number.isFinite(currentPage) ? currentPage : 1;
  const lastPage = Math.max(Number.isFinite(totalPages) ? totalPages : 1, 1);
  const isBusy = Boolean(isLoading);
  const isPreviousDisabled = page <= 1 || isBusy;
  const isNextDisabled = page >= lastPage || isBusy;

  return (
    <div className="site-panel flex flex-col gap-3 border-t border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="site-muted text-xs">
        Page {page} of {lastPage}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={isPreviousDisabled}
          className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, lastPage))}
          disabled={isNextDisabled}
          className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
