import { classNames } from "@lib/ui";

export default function StatusNotice({ children, className = "mt-5", tone = "error" }) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={classNames(
        "rounded-lg border px-4 py-3 text-sm",
        tone === "success" ? "site-success" : "site-danger",
        className,
      )}
    >
      {children}
    </div>
  );
}
