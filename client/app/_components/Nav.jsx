"use client";
import { useAuth } from "@components/auth/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import MessagesMenu from "./MessagesMenu";
import NotificationsMenu from "./NotificationsMenu";
import ThemeToggle from "./theme/ThemeToggle";
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
];
function getUserRole(role) {
  if (
    role === "jobseeker" ||
    role === "employer" ||
    role === "admin" ||
    role === "superadmin"
  ) {
    return role;
  }
  return undefined;
}
export default function Nav() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const userRole = getUserRole(user?.role);
  const roleMenuItems =
    userRole === "admin" || userRole === "superadmin"
      ? [
          {
            label: "Dashboard",
            href: "/dashboard",
            icon: "chart",
          },
          {
            label: "Manage Jobs",
            href: "/manage-jobs",
            icon: "briefcase",
          },
          {
            label: "Job Seekers",
            href: "/candidates",
            icon: "search",
          },
          {
            label: "Manage Users",
            href: "/manage-users",
            icon: "user",
          },
          {
            label: "Manage Newsletter",
            href: "/manage-newsletter",
            icon: "mail",
          },
          {
            label: "System Monitor",
            href: "/system-monitor",
            icon: "chart",
          },
        ]
      : userRole === "employer"
        ? [
            {
              label: "Dashboard",
              href: "/dashboard",
              icon: "chart",
            },
            {
              label: "Manage Jobs",
              href: "/manage-jobs",
              icon: "briefcase",
            },
            {
              label: "Job Seekers",
              href: "/candidates",
              icon: "search",
            },
          ]
        : userRole === "jobseeker"
          ? [
              {
                label: "My Jobs",
                href: "/my-jobs",
                icon: "briefcase",
              },
              {
                label: "Applications",
                href: "/applications",
                icon: "file",
              },
              {
                label: "Saved Jobs",
                href: "/saved-jobs",
                icon: "bell",
              },
            ]
          : [];
  const userEmail = user?.email;
  const userName = user?.username || user?.name;
  const displayName =
    userName && userName !== userEmail
      ? userName
      : (userEmail ?? "Profile");
  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }
    function handlePointerDown(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event) {
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
    <header className="site-border site-nav sticky top-0 z-20 border-b py-3">
      <div className="site-section">
        <div className="site-container flex items-center justify-between">
          <div className="flex items-center gap-14">
            <Link
              href="/"
              className="brand-logo mb-1 inline-flex h-9 items-center text-2xl tracking-tight"
            >
              Hire<span className="site-accent">Nova</span>
            </Link>

            <nav className="hidden items-center gap-5 text-base font-semibold md:flex">
              <Link
                href="/features"
                className="site-link inline-flex h-9 items-center transition hover:text-(--site-accent)"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="site-link inline-flex h-9 items-center transition hover:text-(--site-accent)"
              >
                About
              </Link>
              <Link
                href="/jobs"
                className="site-link inline-flex h-9 items-center transition hover:text-(--site-accent)"
              >
                Jobs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsMenu enabled={isAuthenticated} currentUserId={user?.id} />
            <MessagesMenu
              enabled={isAuthenticated}
              currentUserId={user?.id}
            />
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((current) => !current)}
                  className="site-border site-panel inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-(--site-accent) hover:text-(--site-accent)"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                >
                  <Icon name="user" />
                </button>

                {isProfileOpen ? (
                  <div
                    className="site-border site-card absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border py-2"
                    role="menu"
                  >
                    <div className="border-b border-(--site-border) px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="site-badge flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                          <Icon name="user" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {displayName}
                          </p>
                          {userEmail && displayName !== userEmail ? (
                            <p className="site-muted mt-0.5 truncate text-xs">
                              {userEmail}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {roleMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsProfileOpen(false)}
                          className="group mx-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition hover:bg-(--site-panel) hover:text-(--site-accent)"
                          role="menuitem"
                        >
                          <span className="site-border site-panel flex h-8 w-8 items-center justify-center rounded-md border transition group-hover:border-(--site-accent)">
                            <Icon name={item.icon} />
                          </span>
                          {item.label}
                        </Link>
                      ))}
                      {roleMenuItems.length > 0 ? (
                        <div className="mx-4 my-1 border-t border-(--site-border)" />
                      ) : null}
                      {accountMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsProfileOpen(false)}
                          className="group mx-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition hover:bg-(--site-panel) hover:text-(--site-accent)"
                          role="menuitem"
                        >
                          <span className="site-border site-panel flex h-8 w-8 items-center justify-center rounded-md border transition group-hover:border-(--site-accent)">
                            <Icon name={item.icon} />
                          </span>
                          {item.label}
                        </Link>
                      ))}
                      <ThemeToggle variant="menu" />
                    </div>

                    <div className="border-t border-(--site-border) pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          router.replace("/");
                        }}
                        className="group mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition hover:bg-(--site-panel) hover:text-(--site-accent)"
                        role="menuitem"
                      >
                        <span className="site-border site-panel flex h-8 w-8 items-center justify-center rounded-md border transition group-hover:border-(--site-accent)">
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
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
