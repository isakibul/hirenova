"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

function formatTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function NotificationsMenu({ enabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  async function loadNotifications() {
    if (!enabled) {
      return;
    }

    try {
      const response = await fetch("/api/notifications?limit=6", {
        cache: "no-store",
      });
      const body = await response.json();

      if (response.ok) {
        setNotifications(body.data ?? []);
        setUnreadCount(body.meta?.unreadCount ?? 0);
      }
    } catch {
      // Keep the notification menu quiet if the session expires mid-request.
    }
  }

  async function markOneAsRead(notification) {
    const id = notification.id ?? notification._id;
    if (!id || notification.readAt) {
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        (item.id ?? item._id) === id
          ? { ...item, readAt: new Date().toISOString(), isRead: true }
          : item,
      ),
    );
    setUnreadCount((current) => Math.max(current - 1, 0));

    await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
  }

  async function markAllAsRead() {
    if (!unreadCount) {
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) => ({ ...item, readAt, isRead: true })),
    );
    setUnreadCount(0);

    await fetch("/api/notifications/read-all", {
      method: "PATCH",
    });
  }

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let ignore = false;

    async function loadInitialNotifications() {
      try {
        const response = await fetch("/api/notifications?limit=6", {
          cache: "no-store",
        });
        const body = await response.json();

        if (!ignore && response.ok) {
          setNotifications(body.data ?? []);
          setUnreadCount(body.meta?.unreadCount ?? 0);
        }
      } catch {
        // Keep the notification menu quiet if the session expires mid-request.
      }
    }

    loadInitialNotifications();

    return () => {
      ignore = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            loadNotifications();
          }
        }}
        className="site-border site-panel relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-[var(--site-accent)]"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Icon name="bell" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--site-button-bg)] px-1 text-[10px] font-bold text-[var(--site-button-fg)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="site-border site-card absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border"
          role="menu"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--site-border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="site-muted mt-0.5 text-xs">
                {unreadCount ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={!unreadCount}
              className="site-link text-xs font-semibold disabled:opacity-50"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto py-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm">
                <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                  <Icon name="bell" />
                </div>
                <p className="mt-3 font-semibold">No notifications yet</p>
                <p className="site-muted mt-1 leading-6">
                  Updates about jobs and applications will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const id = notification.id ?? notification._id;
                const isUnread = !notification.readAt;
                const content = (
                  <div className="flex gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        isUnread
                          ? "bg-[var(--site-button-bg)]"
                          : "bg-[var(--site-border)]"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {notification.title}
                      </p>
                      <p className="site-muted mt-1 line-clamp-2 text-xs leading-5">
                        {notification.message}
                      </p>
                      <p className="site-muted mt-2 text-[11px]">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                );

                return notification.link ? (
                  <Link
                    key={id}
                    href={notification.link}
                    onClick={() => {
                      markOneAsRead(notification);
                      setIsOpen(false);
                    }}
                    className="block px-4 py-3 transition hover:bg-[var(--site-panel)]"
                    role="menuitem"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={id}
                    type="button"
                    onClick={() => markOneAsRead(notification)}
                    className="block w-full px-4 py-3 text-left transition hover:bg-[var(--site-panel)]"
                    role="menuitem"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-[var(--site-border)] p-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="site-panel block rounded-md px-3 py-2 text-center text-sm font-semibold transition hover:border-[var(--site-accent)]"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
