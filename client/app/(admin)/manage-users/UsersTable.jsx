import Icon from "@components/Icon";
import PaginationControls from "@components/PaginationControls";
import { TableRowsSkeleton } from "@components/Skeleton";
import SelectField from "@components/forms/SelectField";
import { formatDate, formatTitle as formatStatus } from "@lib/ui";
import { roleTabs, userSortOptions } from "./userUtils";

export default function UsersTable({
  canChangeUserRole,
  canChangeUserStatus,
  canDeleteUser,
  currentUserId,
  deletingUserId,
  getRoleOptionsForUser,
  getUserId,
  isLoading,
  loadingUserId,
  onDelete,
  onPageChange,
  onRequestRoleChange,
  onRequestStatusChange,
  onSearch,
  onSelectUser,
  onSetRoleFilter,
  onSetSearch,
  onSetSearchInput,
  onSetSortBy,
  onSetSortType,
  page,
  pagination,
  roleFilter,
  roleUpdatingUserId,
  search,
  searchInput,
  selectedUserId,
  sortBy,
  sortType,
  statusUpdatingUserId,
  totalPages,
  users,
}) {
  return (
    <div className="site-border site-card overflow-hidden rounded-lg border xl:col-span-2">
      <div className="site-panel border-b border-[var(--site-border)] p-4">
        <form
          onSubmit={onSearch}
          className="grid gap-3 lg:grid-cols-[1fr_170px_140px]"
        >
          <label className="relative">
            <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Icon name="search" />
            </span>
            <input
              value={searchInput}
              onChange={(event) => onSetSearchInput(event.target.value)}
              className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
              placeholder="Search username or email"
            />
          </label>
          <SelectField
            value={sortBy}
            onChange={(nextValue) => {
              onPageChange(1);
              onSetSortBy(nextValue);
            }}
            options={userSortOptions}
            className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"
          />
          <button className="site-button h-10 rounded-md px-3 text-sm font-semibold transition">
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="site-border site-field flex rounded-md border p-1">
            {roleTabs.map((tab) => {
              const isActive = roleFilter === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    onPageChange(1);
                    onSetRoleFilter(tab.value);
                  }}
                  className={`rounded px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? "site-button"
                      : "site-muted hover:text-[var(--site-fg)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              onPageChange(1);
              onSetSortType((current) => (current === "dsc" ? "asc" : "dsc"));
            }}
            className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold"
          >
            {sortType === "dsc" ? "Descending" : "Ascending"}
          </button>
          {search ? (
            <button
              type="button"
              onClick={() => {
                onSetSearch("");
                onSetSearchInput("");
                onPageChange(1);
              }}
              className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold"
            >
              Clear Search
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="site-panel text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRowsSkeleton columns={5} rows={6} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="font-semibold">No users found</p>
                  <p className="site-muted mt-1 text-xs">
                    Create a user or adjust your search.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const userId = getUserId(user);
                const isSelected = selectedUserId === userId;
                const isCurrentUser = currentUserId === userId;
                const isBusy =
                  loadingUserId === userId ||
                  roleUpdatingUserId === userId ||
                  statusUpdatingUserId === userId ||
                  deletingUserId === userId;
                const isSuspended = user.status === "suspended";

                return (
                  <tr
                    key={userId}
                    className={`border-t border-[var(--site-border)] ${
                      isSelected ? "bg-[var(--site-panel)]" : ""
                    }`}
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="flex gap-3">
                        <span className="site-badge mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                          <Icon name="user" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {user.username ?? "Unnamed user"}
                            {isCurrentUser ? (
                              <span className="site-muted ml-2 text-xs font-medium">
                                You
                              </span>
                            ) : null}
                          </p>
                          <p className="site-muted mt-1 truncate text-xs">
                            {user.email ?? "Email not set"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <SelectField
                        value={user.role}
                        onChange={(nextRole) =>
                          onRequestRoleChange(user, nextRole)
                        }
                        options={getRoleOptionsForUser(user)}
                        disabled={
                          isBusy || isCurrentUser || !canChangeUserRole(user)
                        }
                        className="site-field min-h-9 w-36 rounded-md border px-3 py-1.5 text-xs font-semibold focus:outline-none"
                      />
                      {roleUpdatingUserId === userId ? (
                        <p className="site-muted mt-1 text-xs">Updating...</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="site-badge rounded px-2 py-1 text-xs font-semibold">
                        {formatStatus(user.status)}
                      </span>
                    </td>
                    <td className="site-muted whitespace-nowrap px-4 py-4 align-top text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectUser(user)}
                          disabled={isBusy}
                          className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                        >
                          {loadingUserId === userId ? "Loading" : "View"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestStatusChange(user)}
                          disabled={
                            isBusy ||
                            isCurrentUser ||
                            !canChangeUserStatus(user)
                          }
                          className={
                            isSuspended
                              ? "site-button rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50"
                              : "rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-50"
                          }
                        >
                          {statusUpdatingUserId === userId
                            ? "Updating"
                            : isSuspended
                              ? "Activate"
                              : "Suspend"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(user)}
                          disabled={
                            isBusy || isCurrentUser || !canDeleteUser(user)
                          }
                          className="rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-50"
                        >
                          {deletingUserId === userId ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={pagination?.page ?? page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
}
