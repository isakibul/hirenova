import ConfirmDialog from "@components/ConfirmDialog";

import { formatRole } from "./userUtils";

export default function UserConfirmDialogs({
  deletingUserId,
  getUserId,
  onCancelDelete,
  onCancelRoleChange,
  onCancelStatusChange,
  onConfirmDelete,
  onConfirmRoleChange,
  onConfirmStatusChange,
  rolePendingChange,
  roleUpdatingUserId,
  statusPendingChange,
  statusUpdatingUserId,
  userPendingDelete,
}) {
  return (
    <>
      {userPendingDelete ? (
        <ConfirmDialog
          title="Delete user?"
          icon="trash"
          tone="danger"
          confirmLabel="Delete User"
          pendingLabel="Deleting..."
          isPending={deletingUserId === getUserId(userPendingDelete)}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        >
          This will permanently delete{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {userPendingDelete.username ?? userPendingDelete.email ?? "this user"}
          </span>
          . This action cannot be undone.
        </ConfirmDialog>
      ) : null}

      {statusPendingChange ? (
        <ConfirmDialog
          title={
            statusPendingChange.nextStatus === "suspended"
              ? "Suspend user?"
              : "Activate user?"
          }
          icon={statusPendingChange.nextStatus === "suspended" ? "x" : "check"}
          tone={statusPendingChange.nextStatus === "suspended" ? "danger" : "default"}
          confirmLabel={
            statusPendingChange.nextStatus === "suspended"
              ? "Suspend User"
              : "Activate User"
          }
          pendingLabel="Updating..."
          isPending={statusUpdatingUserId === getUserId(statusPendingChange.user)}
          onCancel={onCancelStatusChange}
          onConfirm={onConfirmStatusChange}
        >
          {statusPendingChange.nextStatus === "suspended" ? "Suspending" : "Activating"}{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {statusPendingChange.user.username ??
              statusPendingChange.user.email ??
              "this user"}
          </span>
          {statusPendingChange.nextStatus === "suspended"
            ? " will block them from signing in until the account is activated again."
            : " will allow them to sign in again."}
        </ConfirmDialog>
      ) : null}

      {rolePendingChange ? (
        <ConfirmDialog
          title="Change user role?"
          icon="user"
          confirmLabel="Confirm Change"
          pendingLabel="Updating..."
          isPending={roleUpdatingUserId === getUserId(rolePendingChange.user)}
          onCancel={onCancelRoleChange}
          onConfirm={onConfirmRoleChange}
        >
          Change{" "}
          <span className="font-semibold text-[var(--site-fg)]">
            {rolePendingChange.user.username ??
              rolePendingChange.user.email ??
              "this user"}
          </span>{" "}
          from {formatRole(rolePendingChange.user.role)} to{" "}
          {formatRole(rolePendingChange.nextRole)}.
        </ConfirmDialog>
      ) : null}
    </>
  );
}
