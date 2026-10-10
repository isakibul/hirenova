export default function LoadingCircle({
  className = "h-4 w-4",
  label = "Loading",
}) {
  return (
    <span
      aria-label={label}
      role="status"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none ${className}`}
    />
  );
}
