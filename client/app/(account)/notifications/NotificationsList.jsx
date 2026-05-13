"use client";

import Icon from "@components/Icon";
import { requestJson } from "@lib/clientApi";
import Link from "next/link";
import { useState } from "react";

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTypeLabel(type) {
  const labels = {
    application_submitted: "Application",
    application_status: "Status",
    job_saved: "Saved job",
    job_closed: "Job",
    job_pending_review: "Review",
    job_approved: "Approved",
    job_declined: "Declined",
    system: "System",
  };

  return labels[type] ?? "Update";
}

export default function NotificationsList({
  initialNotifications = [],
  initialUnreadCount = 0,
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

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

    await requestJson(`/api/notifications/${id}/read`, {
      method: "PATCH",
    }).catch(() => undefined);
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

    await requestJson("/api/notifications/read-all", {
      method: "PATCH",
    }).catch(() => undefined);
  }

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px] sm:items-stretch">
        <div className="site-border site-panel rounded-lg border p-4">
          <p className="site-muted text-xs font-medium">Total notifications</p>
          <p className="mt-2 text-2xl font-semibold">{notifications.length}</p>
        </div>
        <div className="site-border site-panel rounded-lg border p-4">
          <p className="site-muted text-xs font-medium">Unread</p>
          <p className="mt-2 text-2xl font-semibold">{unreadCount}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={!unreadCount}
          className="site-button rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="site-border site-card rounded-lg border p-6">
            <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
              <Icon name="bell" />
            </div>
            <p className="mt-4 font-semibold">No notifications yet</p>
            <p className="site-muted mt-2 text-sm leading-6">
              When applications, saves, or job updates happen, they will show up
              here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const id = notification.id ?? notification._id;
            const isUnread = !notification.readAt;
            const content = (
              <div className="flex gap-4">
                <span
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                    isUnread
                      ? "bg-[var(--site-button-bg)]"
                      : "bg-[var(--site-border)]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold">
                        {notification.title}
                      </p>
                      <p className="site-muted mt-1 text-sm leading-6">
                        {notification.message}
                      </p>
                    </div>
                    <span className="site-badge w-fit rounded-md px-2.5 py-1 text-xs font-semibold">
                      {getTypeLabel(notification.type)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="site-muted text-xs">
                      {formatDate(notification.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          onClick={() => markOneAsRead(notification)}
                          className="site-link text-sm font-semibold"
                        >
                          Open
                        </Link>
                      ) : null}
                      {isUnread ? (
                        <button
                          type="button"
                          onClick={() => markOneAsRead(notification)}
                          className="site-link text-sm font-semibold"
                        >
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <div
                key={id}
                className="site-border site-card rounded-lg border p-5"
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
