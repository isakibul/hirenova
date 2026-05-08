"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import ThemeToggle from "./theme/ThemeToggle";

type UserRole = "jobseeker" | "employer" | "admin";

const roleMeta: Record<
  UserRole,
  {
    label: string;
  }
> = {
  jobseeker: {
    label: "Job Seeker",
  },
  employer: {
    label: "Employer",
  },
  admin: {
    label: "Admin",
  },
};

const accountMenuItems = [
  {
    label: "Profile",
    href: "/profile",
    icon: "user",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
  },
  {
    label: "Help",
    href: "/help",
    icon: "help",
  },
] as const;

function getRoleMeta(role?: string) {
  if (role === "jobseeker" || role === "employer" || role === "admin") {
    return roleMeta[role];
  }

  return {
    label: "Member",
  };
}

export default function Nav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const activeRole = getRoleMeta(session?.user?.role);
  const displayName =
    session?.user?.name || session?.user?.email || activeRole.label;

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

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
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="site-border site-panel inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-[var(--site-accent)]"
              aria-label="Open profile menu"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
            >
              <Icon name="user" />
            </button>

            {isProfileOpen ? (
              <div
                className="site-border site-card absolute right-0 mt-2 w-72 overflow-hidden rounded-lg border py-2"
                role="menu"
              >
                <div className="border-b border-[var(--site-border)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="site-badge flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      <Icon name="user" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {displayName}
                      </p>
                      {session.user?.email ? (
                        <p className="site-muted mt-0.5 truncate text-xs">
                          {session.user.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="site-badge mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium">
                    {activeRole.label}
                  </p>
                </div>

                <div className="py-1">
                  {accountMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsProfileOpen(false)}
                      className="mx-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition hover:bg-[var(--site-panel)]"
                      role="menuitem"
                    >
                      <span className="site-border site-panel flex h-8 w-8 items-center justify-center rounded-md border">
                        <Icon name={item.icon} />
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-[var(--site-border)] pt-1">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-[var(--site-danger-text)] transition hover:bg-[var(--site-danger-bg)]"
                    role="menuitem"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)]">
                      <Icon name="logOut" />
                    </span>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
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
