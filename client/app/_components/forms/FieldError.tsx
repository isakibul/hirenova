export default function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-[var(--site-danger-text)]">
      {message}
    </p>
  );
}
