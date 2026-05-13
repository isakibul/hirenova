"use client";
import ConfirmDialog from "@components/ConfirmDialog";
import PaginationControls from "@components/PaginationControls";
import { TableRowsSkeleton } from "@components/Skeleton";
import StatusNotice from "@components/StatusNotice";
import { useAuth } from "@components/auth/AuthProvider";
import SelectField from "@components/forms/SelectField";
import Icon from "@components/Icon";
import { requestJson } from "@lib/clientApi";
import { getVisibleErrors, hasValidationErrors, touchAll } from "@lib/formValidation";
import {
    formatDate,
    formatTitle as formatStatus,
    getRecordId as getUserId,
} from "@lib/ui";
import { useCallback, useEffect, useState } from "react";
import UserSidePanel from "./UserSidePanel";
import { adminManagedRoles, buildPayload, emptyForm, formatRole, isAdminLevelRole, roleTabs, roles, userSortOptions, validateUserForm, } from "./userUtils";
export default function ManageUsersClient({ currentUserId, currentUserRole, }) {
    const { user } = useAuth();
    const effectiveUserId = currentUserId ?? user?.id;
    const effectiveUserRole = currentUserRole ?? user?.role ?? "admin";
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortType, setSortType] = useState("dsc");
    const [roleFilter, setRoleFilter] = useState("all");
    const [form, setForm] = useState(emptyForm);
    const [formTouched, setFormTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingUserId, setLoadingUserId] = useState(null);
    const [roleUpdatingUserId, setRoleUpdatingUserId] = useState(null);
    const [statusUpdatingUserId, setStatusUpdatingUserId] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [rolePendingChange, setRolePendingChange] = useState(null);
    const [statusPendingChange, setStatusPendingChange] = useState(null);
    const [userPendingDelete, setUserPendingDelete] = useState(null);
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState(null);
    const totalItems = pagination?.totalItems ?? users.length;
    const totalPages = pagination?.totalPage ?? 1;
    const isSuperAdmin = effectiveUserRole === "superadmin";
    const createRoleOptions = isSuperAdmin ? roles : adminManagedRoles;
    const validationErrors = validateUserForm(form, createRoleOptions);
    const visibleErrors = getVisibleErrors(validationErrors, formTouched, submitAttempted);
    function getRoleOptionsForUser(user) {
        if (isSuperAdmin || isAdminLevelRole(user.role)) {
            return roles;
        }
        return adminManagedRoles;
    }
    function canChangeUserRole(user) {
        return isSuperAdmin || !isAdminLevelRole(user.role);
    }
    function canDeleteUser(user) {
        return isSuperAdmin || !isAdminLevelRole(user.role);
    }
    function canChangeUserStatus(user) {
        return isSuperAdmin || !isAdminLevelRole(user.role);
    }
    function updateFormField(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
        setError(null);
        setNotice(null);
    }
    function markFormTouched(field) {
        setFormTouched((current) => ({
            ...current,
            [field]: true,
        }));
    }
    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({
            page: String(page),
            limit: "10",
            sort_by: sortBy,
            sort_type: sortType,
        });
        if (search) {
            params.set("search", search);
        }
        if (roleFilter !== "all") {
            params.set("role", roleFilter);
        }
        try {
            const body = await requestJson(`/api/manage-users?${params.toString()}`, {}, "Unable to load users.");
            setUsers(body.data ?? []);
            setPagination(body.pagination);
        }
        catch (caughtError) {
            setUsers([]);
            setPagination(undefined);
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to load users.");
        }
        finally {
            setIsLoading(false);
        }
    }, [page, roleFilter, search, sortBy, sortType]);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadUsers();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadUsers]);
    useEffect(() => {
        if ((!userPendingDelete && !rolePendingChange && !statusPendingChange) ||
            deletingUserId ||
            roleUpdatingUserId ||
            statusUpdatingUserId) {
            return;
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setUserPendingDelete(null);
                setRolePendingChange(null);
                setStatusPendingChange(null);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        deletingUserId,
        rolePendingChange,
        roleUpdatingUserId,
        statusPendingChange,
        statusUpdatingUserId,
        userPendingDelete,
    ]);
    function resetForm() {
        setForm(emptyForm);
        setFormTouched({});
        setSubmitAttempted(false);
        setSelectedUserId(null);
        setSelectedUser(null);
        setIsFormOpen(true);
        setNotice(null);
        setError(null);
    }
    async function handleSelectUser(user) {
        const userId = getUserId(user);
        if (!userId) {
            return;
        }
        setLoadingUserId(userId);
        setNotice(null);
        setError(null);
        try {
            const body = await requestJson(`/api/manage-users/${userId}`, {}, "Unable to load this user.");
            setSelectedUserId(userId);
            setSelectedUser({ ...user, ...body.data, id: userId });
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to load this user.");
        }
        finally {
            setLoadingUserId(null);
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitAttempted(true);
        setFormTouched(touchAll(validationErrors));
        if (hasValidationErrors(validationErrors)) {
            return;
        }
        setIsSubmitting(true);
        setNotice(null);
        setError(null);
        try {
            await requestJson("/api/manage-users", {
                method: "POST",
                body: JSON.stringify(buildPayload(form)),
            }, "Unable to create user.");
            setNotice("User created.");
            setForm(emptyForm);
            setFormTouched({});
            setSubmitAttempted(false);
            await loadUsers();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to create user.");
        }
        finally {
            setIsSubmitting(false);
        }
    }
    function requestRoleChange(user, nextRole) {
        const userId = getUserId(user);
        const canUseRole = getRoleOptionsForUser(user).some((role) => role.value === nextRole);
        if (!userId ||
            user.role === nextRole ||
            !roles.some((role) => role.value === nextRole) ||
            !canChangeUserRole(user) ||
            !canUseRole) {
            return;
        }
        setRolePendingChange({ user, nextRole });
        setNotice(null);
        setError(null);
    }
    async function confirmRoleChange() {
        if (!rolePendingChange) {
            return;
        }
        const { user, nextRole } = rolePendingChange;
        const userId = getUserId(user);
        if (!userId) {
            setRolePendingChange(null);
            return;
        }
        setRoleUpdatingUserId(userId);
        setNotice(null);
        setError(null);
        try {
            await requestJson(`/api/manage-users/${userId}`, {
                method: "PATCH",
                body: JSON.stringify({ role: nextRole }),
            }, "Unable to update user role.");
            setNotice(`${user.username ?? user.email ?? "User"} role updated to ${formatRole(nextRole)}.`);
            if (selectedUserId === userId) {
                setSelectedUser((current) => current ? { ...current, role: nextRole } : current);
            }
            setRolePendingChange(null);
            await loadUsers();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to update user role.");
        }
        finally {
            setRoleUpdatingUserId(null);
        }
    }
    function requestStatusChange(user) {
        const userId = getUserId(user);
        const nextStatus = user.status === "suspended" ? "active" : "suspended";
        if (!userId || !canChangeUserStatus(user) || effectiveUserId === userId) {
            return;
        }
        setStatusPendingChange({ user, nextStatus });
        setNotice(null);
        setError(null);
    }
    async function confirmStatusChange() {
        if (!statusPendingChange) {
            return;
        }
        const { user, nextStatus } = statusPendingChange;
        const userId = getUserId(user);
        if (!userId) {
            setStatusPendingChange(null);
            return;
        }
        setStatusUpdatingUserId(userId);
        setNotice(null);
        setError(null);
        try {
            await requestJson(`/api/manage-users/${userId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: nextStatus }),
            }, "Unable to update user status.");
            setNotice(`${user.username ?? user.email ?? "User"} ${nextStatus === "suspended" ? "suspended" : "activated"}.`);
            if (selectedUserId === userId) {
                setSelectedUser((current) => current ? { ...current, status: nextStatus } : current);
            }
            setStatusPendingChange(null);
            await loadUsers();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to update user status.");
        }
        finally {
            setStatusUpdatingUserId(null);
        }
    }
    function handleDelete(user) {
        setUserPendingDelete(user);
    }
    async function confirmDelete() {
        if (!userPendingDelete) {
            return;
        }
        const userId = getUserId(userPendingDelete);
        if (!userId) {
            setUserPendingDelete(null);
            return;
        }
        setDeletingUserId(userId);
        setNotice(null);
        setError(null);
        try {
            await requestJson(`/api/manage-users/${userId}`, {
                method: "DELETE",
            }, "Unable to delete user.");
            if (selectedUserId === userId) {
                setSelectedUserId(null);
                setSelectedUser(null);
            }
            setUserPendingDelete(null);
            setNotice("User deleted.");
            await loadUsers();
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to delete user.");
        }
        finally {
            setDeletingUserId(null);
        }
    }
    function handleSearch(event) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }
    return (<section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Manage Users
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Create users, review account details, change account roles, and
              remove accounts any time.
            </p>
          </div>
          <button type="button" onClick={resetForm} className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition">
            <Icon name="plus"/>
            New User
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Total Users</p>
            <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Current Page</p>
            <p className="mt-2 text-2xl font-semibold">
              {pagination?.page ?? page}
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Sort</p>
            <p className="mt-2 text-2xl font-semibold">
              {sortType === "dsc" ? "Newest" : "Oldest"}
            </p>
          </div>
        </div>

        <StatusNotice tone="success">{notice}</StatusNotice>
        <StatusNotice>{error}</StatusNotice>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_415px]">
          <div className="site-border site-card overflow-hidden rounded-lg border xl:w-[calc(100%+4px)]">
            <div className="site-panel border-b border-[var(--site-border)] p-4">
              <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_170px_140px]">
                <label className="relative">
                  <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="search"/>
                  </span>
                  <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="site-field h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none" placeholder="Search username or email"/>
                </label>
                <SelectField value={sortBy} onChange={(nextValue) => {
            setPage(1);
            setSortBy(nextValue);
        }} options={userSortOptions} className="site-field h-10 rounded-md border px-3 text-sm focus:outline-none"/>
                <button className="site-button h-10 rounded-md px-3 text-sm font-semibold transition">
                  Search
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="site-border site-field flex rounded-md border p-1">
                  {roleTabs.map((tab) => {
            const isActive = roleFilter === tab.value;
            return (<button key={tab.value} type="button" onClick={() => {
                    setPage(1);
                    setRoleFilter(tab.value);
                }} className={`rounded px-3 py-1 text-xs font-semibold transition ${isActive
                    ? "site-button"
                    : "site-muted hover:text-[var(--site-fg)]"}`}>
                        {tab.label}
                      </button>);
        })}
                </div>
                <button type="button" onClick={() => {
            setPage(1);
            setSortType((current) => current === "dsc" ? "asc" : "dsc");
        }} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold">
                  {sortType === "dsc" ? "Descending" : "Ascending"}
                </button>
                {search ? (<button type="button" onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
            }} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold">
                    Clear Search
                  </button>) : null}
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
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (<TableRowsSkeleton columns={5} rows={6} />) : users.length === 0 ? (<tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <p className="font-semibold">No users found</p>
                        <p className="site-muted mt-1 text-xs">
                          Create a user or adjust your search.
                        </p>
                      </td>
                    </tr>) : (users.map((user) => {
            const userId = getUserId(user);
            const isSelected = selectedUserId === userId;
            const isCurrentUser = effectiveUserId === userId;
            const isBusy = loadingUserId === userId ||
                roleUpdatingUserId === userId ||
                statusUpdatingUserId === userId ||
                deletingUserId === userId;
            const isSuspended = user.status === "suspended";
            return (<tr key={userId} className={`border-t border-[var(--site-border)] ${isSelected ? "bg-[var(--site-panel)]" : ""}`}>
                          <td className="px-4 py-4 align-top">
                            <div className="flex gap-3">
                              <span className="site-badge mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                                <Icon name="user"/>
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold">
                                  {user.username ?? "Unnamed user"}
                                  {isCurrentUser ? (<span className="site-muted ml-2 text-xs font-medium">
                                      You
                                    </span>) : null}
                                </p>
                                <p className="site-muted mt-1 truncate text-xs">
                                  {user.email ?? "Email not set"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <SelectField value={user.role} onChange={(nextRole) => requestRoleChange(user, nextRole)} options={getRoleOptionsForUser(user)} disabled={isBusy ||
                    isCurrentUser ||
                    !canChangeUserRole(user)} className="site-field min-h-9 w-36 rounded-md border px-3 py-1.5 text-xs font-semibold focus:outline-none"/>
                            {roleUpdatingUserId === userId ? (<p className="site-muted mt-1 text-xs">Updating...</p>) : null}
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
                              <button type="button" onClick={() => handleSelectUser(user)} disabled={isBusy} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60">
                                {loadingUserId === userId ? "Loading" : "View"}
                              </button>
                              <button type="button" onClick={() => requestStatusChange(user)} disabled={isBusy ||
                    isCurrentUser ||
                    !canChangeUserStatus(user)} className={isSuspended
                    ? "site-button rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50"
                    : "rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-50"}>
                                {statusUpdatingUserId === userId
                    ? "Updating"
                    : isSuspended
                        ? "Activate"
                        : "Suspend"}
                              </button>
                              <button type="button" onClick={() => handleDelete(user)} disabled={isBusy ||
                    isCurrentUser ||
                    !canDeleteUser(user)} className="rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-50">
                                {deletingUserId === userId
                    ? "Deleting"
                    : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>);
        }))}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={pagination?.page ?? page}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>

          <UserSidePanel
            canChangeUserRole={canChangeUserRole}
            canChangeUserStatus={canChangeUserStatus}
            createRoleOptions={createRoleOptions}
            currentUserId={effectiveUserId}
            form={form}
            isFormOpen={isFormOpen}
            isSubmitting={isSubmitting}
            isSuperAdmin={isSuperAdmin}
            onRequestRoleChange={requestRoleChange}
            onRequestStatusChange={requestStatusChange}
            onSubmit={handleSubmit}
            onToggleOpen={() => setIsFormOpen((current) => !current)}
            onTouchField={markFormTouched}
            onUpdateField={updateFormField}
            roleOptionsForUser={getRoleOptionsForUser}
            roleUpdatingUserId={roleUpdatingUserId}
            selectedUser={selectedUser}
            selectedUserId={selectedUserId}
            statusUpdatingUserId={statusUpdatingUserId}
            visibleErrors={visibleErrors}
          />
        </div>
      </div>

      {userPendingDelete ? (<ConfirmDialog title="Delete user?" icon="trash" tone="danger" confirmLabel="Delete User" pendingLabel="Deleting..." isPending={deletingUserId === getUserId(userPendingDelete)} onCancel={() => setUserPendingDelete(null)} onConfirm={confirmDelete}>
          This will permanently delete{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {userPendingDelete.username ?? userPendingDelete.email ?? "this user"}
          </span>
          . This action cannot be undone.
        </ConfirmDialog>) : null}
      {statusPendingChange ? (<ConfirmDialog title={statusPendingChange.nextStatus === "suspended" ? "Suspend user?" : "Activate user?"} icon={statusPendingChange.nextStatus === "suspended" ? "x" : "check"} tone={statusPendingChange.nextStatus === "suspended" ? "danger" : "default"} confirmLabel={statusPendingChange.nextStatus === "suspended" ? "Suspend User" : "Activate User"} pendingLabel="Updating..." isPending={statusUpdatingUserId === getUserId(statusPendingChange.user)} onCancel={() => setStatusPendingChange(null)} onConfirm={confirmStatusChange}>
          {statusPendingChange.nextStatus === "suspended" ? "Suspending" : "Activating"}{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {statusPendingChange.user.username ?? statusPendingChange.user.email ?? "this user"}
          </span>
          {statusPendingChange.nextStatus === "suspended"
            ? " will block them from signing in until the account is activated again."
            : " will allow them to sign in again."}
        </ConfirmDialog>) : null}
      {rolePendingChange ? (<ConfirmDialog title="Change user role?" icon="user" confirmLabel="Confirm Change" pendingLabel="Updating..." isPending={roleUpdatingUserId === getUserId(rolePendingChange.user)} onCancel={() => setRolePendingChange(null)} onConfirm={confirmRoleChange}>
          Change{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {rolePendingChange.user.username ?? rolePendingChange.user.email ?? "this user"}
          </span>{" "}
          from {formatRole(rolePendingChange.user.role)} to{" "}
          {formatRole(rolePendingChange.nextRole)}.
        </ConfirmDialog>) : null}
    </section>);
}
