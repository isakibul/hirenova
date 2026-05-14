"use client";

import ConfirmDialog from "@components/ConfirmDialog";
import Icon from "@components/Icon";
import StatusNotice from "@components/StatusNotice";
import { useAuth } from "@components/auth/AuthProvider";
import { requestJson } from "@lib/clientApi";
import {
  getVisibleErrors,
  hasValidationErrors,
  touchAll,
} from "@lib/formValidation";
import { getRecordId as getUserId } from "@lib/ui";
import { useCallback, useEffect, useState } from "react";
import UserSidePanel from "./UserSidePanel";
import UsersTable from "./UsersTable";
import {
  adminManagedRoles,
  buildPayload,
  emptyForm,
  formatRole,
  isAdminLevelRole,
  roles,
  validateUserForm,
} from "./userUtils";

export default function ManageUsersClient({ currentUserId, currentUserRole }) {
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
    const [isFormOpen, setIsFormOpen] = useState(false);
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
    return (<section className="site-section py-8">
      <div className="site-container">
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
          <div className="site-border site-panel rounded-lg border p-3">
            <p className="site-muted text-xs font-medium">Total Users</p>
            <p className="mt-1 text-xl font-semibold">{totalItems}</p>
          </div>
          <div className="site-border site-panel rounded-lg border p-3">
            <p className="site-muted text-xs font-medium">Current Page</p>
            <p className="mt-1 text-xl font-semibold">
              {pagination?.page ?? page}
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-3">
            <p className="site-muted text-xs font-medium">Sort</p>
            <p className="mt-1 text-xl font-semibold">
              {sortType === "dsc" ? "Newest" : "Oldest"}
            </p>
          </div>
        </div>

        <StatusNotice tone="success">{notice}</StatusNotice>
        <StatusNotice>{error}</StatusNotice>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_415px]">
          <UsersTable
            canChangeUserRole={canChangeUserRole}
            canChangeUserStatus={canChangeUserStatus}
            canDeleteUser={canDeleteUser}
            currentUserId={effectiveUserId}
            deletingUserId={deletingUserId}
            getRoleOptionsForUser={getRoleOptionsForUser}
            getUserId={getUserId}
            isLoading={isLoading}
            loadingUserId={loadingUserId}
            onDelete={handleDelete}
            onPageChange={setPage}
            onRequestRoleChange={requestRoleChange}
            onRequestStatusChange={requestStatusChange}
            onSearch={handleSearch}
            onSelectUser={handleSelectUser}
            onSetRoleFilter={setRoleFilter}
            onSetSearch={setSearch}
            onSetSearchInput={setSearchInput}
            onSetSortBy={setSortBy}
            onSetSortType={setSortType}
            page={page}
            pagination={pagination}
            roleFilter={roleFilter}
            roleUpdatingUserId={roleUpdatingUserId}
            search={search}
            searchInput={searchInput}
            selectedUserId={selectedUserId}
            sortBy={sortBy}
            sortType={sortType}
            statusUpdatingUserId={statusUpdatingUserId}
            totalPages={totalPages}
            users={users}
          />

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
