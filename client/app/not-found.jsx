import Icon from "@components/Icon";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="site-section py-16">
      <div className="site-container text-center">
        <div className="site-badge mx-auto flex h-14 w-14 items-center justify-center rounded-lg">
          <Icon name="search" />
        </div>
        <p className="site-accent mt-6 text-xs font-semibold uppercase tracking-widest">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Page not found
        </h1>
        <p className="site-muted mx-auto mt-3 max-w-xl text-sm leading-6">
          The page you are looking for may have moved, expired, or never existed.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/jobs"
            className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
          >
            <Icon name="briefcase" />
            Browse Jobs
          </Link>
          <Link
            href="/"
            className="site-border site-field inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold"
          >
            <Icon name="target" />
            Go Home
          </Link>
          <Link
            href="/help"
            className="site-border site-field inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold"
          >
            <Icon name="help" />
            Help Center
          </Link>
        </div>
      </div>
    </section>
  );
}
