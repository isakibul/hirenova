"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { requestJson } from "@lib/clientApi";
import { formatDateTime, getRecordId } from "@lib/ui";
import {
  countUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../(account)/notifications/notificationUtils";
import Icon from "./Icon";

export default function NotificationsMenu({ currentUserId = "", enabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  const loadNotifications = useCallback(async (userId = currentUserId) => {
    if (!enabled) {
      return;
    }

    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const body = await requestJson("/notifications?limit=6", {
        cache: "no-store",
      });
      const nextNotifications = body.data ?? [];
      const nextUnreadCount =
        body.meta?.unreadCount ??
        countUnreadNotifications(nextNotifications);
      setNotifications(nextNotifications);
      setUnreadCount(nextUnreadCount);
    } catch {
      // Keep the notification menu quiet if the session changes mid-request.
    }
  }, [currentUserId, enabled]);

  async function markOneAsRead(notification) {
    const id = getRecordId(notification);
    if (!id || notification.readAt) {
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      markNotificationRead(current, id, readAt),
    );
    setUnreadCount((current) => Math.max(current - 1, 0));

    await requestJson(`/notifications/${id}/read`, {
      method: "PATCH",
    }).catch(() => undefined);
  }

  async function markAllAsRead() {
    if (!unreadCount) {
      return;
    }

    const readAt = new Date().toISOString();
    setNotifications((current) =>
      markAllNotificationsRead(current, readAt),
    );
    setUnreadCount(0);

    await requestJson("/notifications/read-all", {
      method: "PATCH",
    }).catch(() => undefined);
  }

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const timeoutId = window.setTimeout(loadNotifications, 0);

    const intervalId = window.setInterval(loadNotifications, 30000);

    function handleFocus() {
      loadNotifications();
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("hirenova:notifications-refresh", handleFocus);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("hirenova:notifications-refresh", handleFocus);
    };
  }, [currentUserId, enabled, loadNotifications]);

  useEffect(() => {
    if (!enabled || !isOpen) {
      return undefined;
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentUserId, enabled, isOpen, loadNotifications]);

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
        className="site-border site-panel relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-(--site-accent) hover:text-(--site-accent)"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Icon name="bell" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--site-button-bg) px-1 text-[10px] font-bold text-(--site-button-fg)">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="site-border site-card fixed left-4 right-4 top-16 z-50 overflow-hidden rounded-lg border sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(22rem,calc(100vw-2rem))]"
          role="menu"
        >
          <div className="flex items-center justify-between gap-3 border-b border-(--site-border) px-4 py-3">
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
              className="site-link text-xs font-semibold transition hover:text-(--site-accent) disabled:opacity-50 disabled:hover:text-current"
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
                const id = getRecordId(notification);
                const isUnread = !notification.readAt;
                const content = (
                  <div className="flex gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        isUnread
                          ? "bg-(--site-button-bg)"
                          : "bg-(--site-border)"
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
                        {formatDateTime(notification.createdAt)}
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
                    className="block px-4 py-3 transition hover:bg-(--site-panel) hover:text-(--site-accent)"
                    role="menuitem"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={id}
                    type="button"
                    onClick={() => markOneAsRead(notification)}
                    className="block w-full px-4 py-3 text-left transition hover:bg-(--site-panel) hover:text-(--site-accent)"
                    role="menuitem"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-(--site-border) p-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="site-panel site-border block rounded-md border px-3 py-2 text-center text-sm font-semibold transition hover:border-(--site-accent) hover:text-(--site-accent)"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
