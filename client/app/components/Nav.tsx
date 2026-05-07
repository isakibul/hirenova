"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "./theme/ThemeToggle";

export default function Nav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="site-border site-nav sticky top-0 z-20 flex items-center justify-between border-b px-5 md:px-[10vw] py-3">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Hire<span className="site-accent">Nova</span>
      </Link>

      <nav className="hidden gap-5 text-[13px] md:flex">
        <Link href="/features" className="site-link">
          Features
        </Link>
        <Link href="/how-it-works" className="site-link">
          How it Works
        </Link>
        <Link href="/jobs" className="site-link">
          Jobs
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="site-muted hidden max-w-40 truncate text-[13px] sm:inline">
              {session.user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="site-button rounded-md px-3 py-1.5 text-[13px] font-medium transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/signup"
            className="site-button rounded-md px-3 py-1.5 text-[13px] font-medium transition"
          >
            {status === "loading" ? "..." : "Get Started"}
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
