import { classNames } from "@lib/ui";
import Icon from "./Icon";
import Modal from "./Modal";

export default function ConfirmDialog({
  cancelLabel = "Cancel",
  children,
  confirmLabel,
  icon = "check",
  isPending = false,
  onCancel,
  onConfirm,
  pendingLabel = "Working...",
  title,
  tone = "default",
}) {
  const isDanger = tone === "danger";

  return (
    <Modal
      ariaLabelledBy="confirm-dialog-title"
      ariaDescribedBy="confirm-dialog-description"
      onClose={isPending ? undefined : onCancel}
      panelClassName="max-w-md"
    >
      <div className="flex items-start gap-3 border-b border-[var(--site-border)] p-5">
        <span
          className={classNames(
            "rounded-md p-2",
            isDanger
              ? "border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] text-[var(--site-danger-text)]"
              : "site-badge",
          )}
        >
          <Icon name={icon} />
        </span>
        <div className="min-w-0">
          <h2 id="confirm-dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <div
            id="confirm-dialog-description"
            className="site-muted mt-1 text-sm leading-6"
          >
            {children}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={classNames(
            "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60",
            isDanger
              ? "border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] text-[var(--site-danger-text)]"
              : "site-button transition",
          )}
        >
          <Icon name={icon} />
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
