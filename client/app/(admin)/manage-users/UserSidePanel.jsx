import FieldError from "@components/forms/FieldError";
import SelectField from "@components/forms/SelectField";
import Icon from "@components/Icon";
import { formatDate, formatTitle as formatStatus } from "@lib/ui";

export default function UserSidePanel({
  canChangeUserRole,
  canChangeUserStatus,
  createRoleOptions,
  currentUserId,
  form,
  isFormOpen,
  isSubmitting,
  isSuperAdmin,
  onRequestRoleChange,
  onRequestStatusChange,
  onSubmit,
  onToggleOpen,
  onTouchField,
  onUpdateField,
  roleOptionsForUser,
  roleUpdatingUserId,
  selectedUser,
  selectedUserId,
  statusUpdatingUserId,
  visibleErrors,
}) {
  return (
    <aside className="site-border site-card self-start rounded-lg border xl:sticky xl:top-24">
      <div className="flex items-center justify-between border-b border-[var(--site-border)] px-4 py-3">
        <div>
          <h2 className="font-semibold">Create User</h2>
          <p className="site-muted mt-1 text-xs">
            {isSuperAdmin
              ? "Add a job seeker, employer, admin, or super admin account."
              : "Add a job seeker or employer account."}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          className="site-border site-field rounded-md border p-2"
          aria-label={isFormOpen ? "Collapse form" : "Expand form"}
        >
          <Icon name={isFormOpen ? "x" : "plus"} />
        </button>
      </div>

      {isFormOpen ? (
        <form onSubmit={onSubmit} noValidate className="space-y-4 p-4">
          <label className="block">
            <span className="text-sm font-medium">Username</span>
            <input
              value={form.username}
              onChange={(event) => onUpdateField("username", event.target.value)}
              onBlur={() => onTouchField("username")}
              aria-invalid={Boolean(visibleErrors.username)}
              aria-describedby={
                visibleErrors.username ? "user-username-error" : undefined
              }
              className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              minLength={3}
              maxLength={50}
              autoComplete="username"
              required
              placeholder="newuser"
            />
            <FieldError
              id="user-username-error"
              message={visibleErrors.username}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => onUpdateField("email", event.target.value)}
              onBlur={() => onTouchField("email")}
              aria-invalid={Boolean(visibleErrors.email)}
              aria-describedby={
                visibleErrors.email ? "user-email-error" : undefined
              }
              className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              autoComplete="email"
              required
              placeholder="newuser@example.com"
            />
            <FieldError id="user-email-error" message={visibleErrors.email} />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => onUpdateField("password", event.target.value)}
              onBlur={() => onTouchField("password")}
              aria-invalid={Boolean(visibleErrors.password)}
              aria-describedby={
                visibleErrors.password ? "user-password-error" : undefined
              }
              className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              minLength={8}
              maxLength={50}
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
            />
            <FieldError
              id="user-password-error"
              message={visibleErrors.password}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Role</span>
            <SelectField
              value={form.role}
              onChange={(nextValue) => onUpdateField("role", nextValue)}
              onBlur={() => onTouchField("role")}
              options={createRoleOptions}
              className="site-field mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              ariaInvalid={Boolean(visibleErrors.role)}
              ariaDescribedBy={
                visibleErrors.role ? "user-role-error" : undefined
              }
            />
            <FieldError id="user-role-error" message={visibleErrors.role} />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="site-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70"
          >
            <Icon name="check" />
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </form>
      ) : (
        <div className="site-muted p-4 text-sm leading-6">
          Open this panel when you need to create an account. User inspection
          and role/status changes remain available below.
        </div>
      )}

      <div className="border-t border-[var(--site-border)]">
        <div className="px-4 py-3">
          <h3 className="font-semibold">User Details</h3>
          <p className="site-muted mt-1 text-xs">
            Select a user from the list to inspect the account data.
          </p>
        </div>

        {selectedUser ? (
          <div className="space-y-4 p-4 text-sm">
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
                <SelectField
                  value={selectedUser.role}
                  onChange={(nextRole) =>
                    onRequestRoleChange(selectedUser, nextRole)
                  }
                  options={roleOptionsForUser(selectedUser)}
                  disabled={
                    roleUpdatingUserId === selectedUserId ||
                    currentUserId === selectedUserId ||
                    !canChangeUserRole(selectedUser)
                  }
                  className="site-field mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm font-semibold focus:outline-none"
                />
              </div>
              <div>
                <p className="site-muted text-xs font-medium">Status</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {formatStatus(selectedUser.status)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRequestStatusChange(selectedUser)}
                    disabled={
                      statusUpdatingUserId === selectedUserId ||
                      currentUserId === selectedUserId ||
                      !canChangeUserStatus(selectedUser)
                    }
                    className={
                      selectedUser.status === "suspended"
                        ? "site-button rounded-md px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50"
                        : "rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--site-danger-text)] disabled:opacity-50"
                    }
                  >
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
          </div>
        ) : (
          <div className="site-muted p-4 text-sm">No user selected.</div>
        )}
      </div>
    </aside>
  );
}
