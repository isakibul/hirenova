export default function ManageUsersSummary({ page, pagination, sortType, totalItems }) {
  return (
    <div className="mt-6 grid items-stretch gap-3 sm:grid-cols-3">
      <div className="site-border site-panel h-full rounded-lg border p-3">
        <p className="site-muted text-xs font-medium">Total Users</p>
        <p className="mt-1 text-xl font-semibold">{totalItems}</p>
      </div>
      <div className="site-border site-panel h-full rounded-lg border p-3">
        <p className="site-muted text-xs font-medium">Current Page</p>
        <p className="mt-1 text-xl font-semibold">{pagination?.page ?? page}</p>
      </div>
      <div className="site-border site-panel h-full rounded-lg border p-3">
        <p className="site-muted text-xs font-medium">Sort</p>
        <p className="mt-1 text-xl font-semibold">
          {sortType === "dsc" ? "Newest" : "Oldest"}
        </p>
      </div>
    </div>
  );
}
