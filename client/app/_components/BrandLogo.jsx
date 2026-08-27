import Link from "next/link";

export default function BrandLogo({ className = "" }) {
  return (
    <Link
      href="/"
      aria-label="HireNova home"
      className={`brand-logo inline-flex items-center gap-2 tracking-tight ${className}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--site-accent)] text-sm font-extrabold tracking-[-0.16em] text-white shadow-sm">
        H<span className="opacity-70">N</span>
      </span>
      <span className="font-[family-name:var(--font-dm-sans)] font-extrabold leading-none tracking-[-0.045em]">
        Hire<span className="site-accent">Nova</span>
      </span>
    </Link>
  );
}
