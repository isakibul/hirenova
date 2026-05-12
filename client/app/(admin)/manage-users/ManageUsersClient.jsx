"use client";
import FieldError from "@components/forms/FieldError";
import SelectField from "@components/forms/SelectField";
import Icon from "@components/Icon";
import { emailError, getVisibleErrors, hasValidationErrors, passwordError, touchAll, usernameError, } from "@lib/formValidation";
import { useCallback, useEffect, useState } from "react";
const emptyForm = {
    username: "",
    email: "",
    password: "",
    role: "jobseeker",
};
const roles = [
    { value: "jobseeker", label: "Job Seeker" },
    { value: "employer", label: "Employer" },
    { value: "admin", label: "Admin" },
    { value: "superadmin", label: "Super Admin" },
];
const roleTabs = [
    { value: "all", label: "All" },
    { value: "jobseeker", label: "Job Seeker" },
    { value: "employer", label: "Employer" },
    { value: "admin", label: "Admin" },
    { value: "superadmin", label: "Super Admin" },
];
const adminManagedRoles = roles.filter((role) => ["jobseeker", "employer"].includes(role.value));
const userSortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
    { value: "username", label: "Username" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
];
function getMessage(response) {
    if (response.errors?.length) {
        return response.errors.join(" ");
    }
    return response.error ?? response.message ?? "Something went wrong.";
}
function getUserId(user) {
    return user.id ?? user._id ?? "";
}
function formatDate(value) {
    if (!value) {
        return "Not available";
    }
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}
function formatRole(value) {
    return roles.find((role) => role.value === value)?.label ?? "Not set";
}
function formatStatus(value) {
    if (!value) {
        return "Not set";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}
function isAdminLevelRole(role) {
    return role === "admin" || role === "superadmin";
}
function buildPayload(form) {
    return {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
    };
}
function validateUserForm(form, roleOptions = roles) {
    return {
        username: usernameError(form.username),
        email: emailError(form.email),
        password: passwordError(form.password),
        role: roleOptions.some((role) => role.value === form.role)
            ? ""
            : "Choose a valid role.",
    };
}
export default function ManageUsersClient({ currentUserId, currentUserRole = "admin", }) {
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
    const isSuperAdmin = currentUserRole === "superadmin";
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
            const response = await fetch(`/api/manage-users?${params.toString()}`);
            const body = (await response.json());
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
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
            const response = await fetch(`/api/manage-users/${userId}`);
            const body = (await response.json());
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body));
            }
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
            const response = await fetch("/api/manage-users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(buildPayload(form)),
            });
            const body = (await response.json());
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
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
            const response = await fetch(`/api/manage-users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: nextRole }),
            });
            const body = (await response.json());
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
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
        if (!userId || !canChangeUserStatus(user) || currentUserId === userId) {
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
            const response = await fetch(`/api/manage-users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: nextStatus }),
            });
            const body = (await response.json());
            if (!response.ok) {
                throw new Error(getMessage(body));
            }
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
            const response = await fetch(`/api/manage-users/${userId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const body = (await response.json());
                throw new Error(getMessage(body));
            }
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

        {(notice || error) && (<div className={`mt-5 rounded-lg border px-4 py-3 text-sm ${error ? "site-danger" : "site-success"}`}>
            {error ?? notice}
          </div>)}

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
                  {isLoading ? (<tr>
                      <td colSpan={5} className="site-muted px-4 py-10 text-center">
                        Loading users...
                      </td>
                    </tr>) : users.length === 0 ? (<tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <p className="font-semibold">No users found</p>
                        <p className="site-muted mt-1 text-xs">
                          Create a user or adjust your search.
                        </p>
                      </td>
                    </tr>) : (users.map((user) => {
            const userId = getUserId(user);
            const isSelected = selectedUserId === userId;
            const isCurrentUser = currentUserId === userId;
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

            <div className="site-panel flex flex-col gap-3 border-t border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="site-muted text-xs">
                Page {pagination?.page ?? page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1 || isLoading} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                  Previous
                </button>
                <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages))} disabled={page >= totalPages || isLoading} className="site-border site-field rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>

          <aside className="site-border site-card self-start rounded-lg border">
            <div className="flex items-center justify-between border-b border-[var(--site-border)] px-4 py-3">
              <div>
                <h2 className="font-semibold">Create User</h2>
                <p className="site-muted mt-1 text-xs">
                  {isSuperAdmin
                ? "Add a job seeker, employer, admin, or super admin account."
                : "Add a job seeker or employer account."}
                </p>
              </div>
              <button type="button" onClick={() => setIsFormOpen((current) => !current)} className="site-border site-field rounded-md border p-2" aria-label={isFormOpen ? "Collapse form" : "Expand form"}>
                <Icon name={isFormOpen ? "x" : "plus"}/>
              </button>
            </div>

            {isFormOpen ? (<form onSubmit={handleSubmit} noValidate className="space-y-4 p-4">
                <label className="block">
                  <span className="text-sm font-medium">Username</span>
                  <input value={form.username} onChange={(event) => updateFormField("username", event.target.value)} onBlur={() => markFormTouched("username")} aria-invalid={Boolean(visibleErrors.username)} aria-describedby={visibleErrors.username ? "user-username-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={3} maxLength={50} autoComplete="username" required placeholder="newuser"/>
                  <FieldError id="user-username-error" message={visibleErrors.username}/>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Email</span>
                  <input type="email" value={form.email} onChange={(event) => updateFormField("email", event.target.value)} onBlur={() => markFormTouched("email")} aria-invalid={Boolean(visibleErrors.email)} aria-describedby={visibleErrors.email ? "user-email-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" autoComplete="email" required placeholder="newuser@example.com"/>
                  <FieldError id="user-email-error" message={visibleErrors.email}/>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Password</span>
                  <input type="password" value={form.password} onChange={(event) => updateFormField("password", event.target.value)} onBlur={() => markFormTouched("password")} aria-invalid={Boolean(visibleErrors.password)} aria-describedby={visibleErrors.password ? "user-password-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={8} maxLength={50} autoComplete="new-password" required placeholder="At least 8 characters"/>
                  <FieldError id="user-password-error" message={visibleErrors.password}/>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Role</span>
                  <SelectField value={form.role} onChange={(nextValue) => updateFormField("role", nextValue)} onBlur={() => markFormTouched("role")} options={createRoleOptions} className="site-field mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" ariaInvalid={Boolean(visibleErrors.role)} ariaDescribedBy={visibleErrors.role ? "user-role-error" : undefined}/>
                  <FieldError id="user-role-error" message={visibleErrors.role}/>
                </label>

                <button type="submit" disabled={isSubmitting} className="site-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70">
                  <Icon name="check"/>
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </form>) : null}

            <div className="border-t border-[var(--site-border)]">
              <div className="px-4 py-3">
                <h3 className="font-semibold">User Details</h3>
                <p className="site-muted mt-1 text-xs">
                  Select a user from the list to inspect the account data.
                </p>
              </div>

              {selectedUser ? (<div className="space-y-4 p-4 text-sm">
                  <div>
                    <p className="site-muted text-xs font-medium">Username</p>
                    <p className="mt-1 font-semibold">
                      {selectedUser.username ?? "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="site-muted text-xs font-medium">Email</p>
                    <p className="mt-1 break-all font-semibold">
                      {selectedUser.email ?? "Not set"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="site-muted text-xs font-medium">Role</p>
                      <SelectField value={selectedUser.role} onChange={(nextRole) => requestRoleChange(selectedUser, nextRole)} options={getRoleOptionsForUser(selectedUser)} disabled={roleUpdatingUserId === selectedUserId ||
                    currentUserId === selectedUserId ||
                    !canChangeUserRole(selectedUser)} className="site-field mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm font-semibold focus:outline-none"/>
                    </div>
                    <div>
                      <p className="site-muted text-xs font-medium">Status</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {formatStatus(selectedUser.status)}
                        </p>
                        <button type="button" onClick={() => requestStatusChange(selectedUser)} disabled={statusUpdatingUserId === selectedUserId ||
                    currentUserId === selectedUserId ||
                    !canChangeUserStatus(selectedUser)} className={selectedUser.status === "suspended"
                    ? "site-button rounded-md px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50"
                    : "rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-50"}>
                          {selectedUser.status === "suspended"
                    ? "Activate"
                    : "Suspend"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="site-muted text-xs font-medium">Created</p>
                      <p className="mt-1 font-semibold">
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="site-muted text-xs font-medium">Updated</p>
                      <p className="mt-1 font-semibold">
                        {formatDate(selectedUser.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>) : (<div className="site-muted p-4 text-sm">No user selected.</div>)}
            </div>
          </aside>
        </div>
      </div>

      {userPendingDelete ? (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="delete-user-title" aria-describedby="delete-user-description">
          <div className="site-border site-card w-full max-w-md rounded-lg border">
            <div className="flex items-start gap-3 border-b border-[var(--site-border)] p-5">
              <span className="rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] p-2 text-[var(--site-danger-text)]">
                <Icon name="trash"/>
              </span>
              <div className="min-w-0">
                <h2 id="delete-user-title" className="text-lg font-semibold">
                  Delete user?
                </h2>
                <p id="delete-user-description" className="site-muted mt-1 text-sm leading-6">
                  This will permanently delete{" "}
                  <span className="font-semibold text-[var(--site-fg)]">
                    {userPendingDelete.username ??
                userPendingDelete.email ??
                "this user"}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setUserPendingDelete(null)} disabled={deletingUserId === getUserId(userPendingDelete)} className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} disabled={deletingUserId === getUserId(userPendingDelete)} className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--site-danger-text)] disabled:opacity-60">
                <Icon name="trash"/>
                {deletingUserId === getUserId(userPendingDelete)
                ? "Deleting..."
                : "Delete User"}
              </button>
            </div>
          </div>
        </div>) : null}
      {statusPendingChange ? (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="status-change-title" aria-describedby="status-change-description">
          <div className="site-border site-card w-full max-w-md rounded-lg border">
            <div className="flex items-start gap-3 border-b border-[var(--site-border)] p-5">
              <span className={statusPendingChange.nextStatus === "suspended"
                ? "rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] p-2 text-[var(--site-danger-text)]"
                : "site-badge rounded-md p-2"}>
                <Icon name={statusPendingChange.nextStatus === "suspended" ? "x" : "check"}/>
              </span>
              <div className="min-w-0">
                <h2 id="status-change-title" className="text-lg font-semibold">
                  {statusPendingChange.nextStatus === "suspended"
                ? "Suspend user?"
                : "Activate user?"}
                </h2>
                <p id="status-change-description" className="site-muted mt-1 text-sm leading-6">
                  {statusPendingChange.nextStatus === "suspended"
                ? "Suspending"
                : "Activating"}{" "}
                  <span className="font-semibold text-[var(--site-fg)]">
                    {statusPendingChange.user.username ??
                statusPendingChange.user.email ??
                "this user"}
                  </span>
                  {statusPendingChange.nextStatus === "suspended"
                ? " will block them from signing in until the account is activated again."
                : " will allow them to sign in again."}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setStatusPendingChange(null)} disabled={statusUpdatingUserId === getUserId(statusPendingChange.user)} className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={confirmStatusChange} disabled={statusUpdatingUserId === getUserId(statusPendingChange.user)} className={statusPendingChange.nextStatus === "suspended"
                ? "inline-flex items-center justify-center gap-2 rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--site-danger-text)] disabled:opacity-60"
                : "site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60"}>
                <Icon name={statusPendingChange.nextStatus === "suspended" ? "x" : "check"}/>
                {statusUpdatingUserId === getUserId(statusPendingChange.user)
                ? "Updating..."
                : statusPendingChange.nextStatus === "suspended"
                    ? "Suspend User"
                    : "Activate User"}
              </button>
            </div>
          </div>
        </div>) : null}
      {rolePendingChange ? (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="role-change-title" aria-describedby="role-change-description">
          <div className="site-border site-card w-full max-w-md rounded-lg border">
            <div className="flex items-start gap-3 border-b border-[var(--site-border)] p-5">
              <span className="site-badge rounded-md p-2">
                <Icon name="user"/>
              </span>
              <div className="min-w-0">
                <h2 id="role-change-title" className="text-lg font-semibold">
                  Change user role?
                </h2>
                <p id="role-change-description" className="site-muted mt-1 text-sm leading-6">
                  Change{" "}
                  <span className="font-semibold text-[var(--site-fg)]">
                    {rolePendingChange.user.username ??
                rolePendingChange.user.email ??
                "this user"}
                  </span>{" "}
                  from {formatRole(rolePendingChange.user.role)} to{" "}
                  {formatRole(rolePendingChange.nextRole)}.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setRolePendingChange(null)} disabled={roleUpdatingUserId === getUserId(rolePendingChange.user)} className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={confirmRoleChange} disabled={roleUpdatingUserId === getUserId(rolePendingChange.user)} className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60">
                <Icon name="check"/>
                {roleUpdatingUserId === getUserId(rolePendingChange.user)
                ? "Updating..."
                : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>) : null}
    </section>);
}
