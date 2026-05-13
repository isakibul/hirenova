"use client";

import StatusNotice from "@components/StatusNotice";
import { getApiMessage } from "@lib/ui";
import { useEffect, useState } from "react";
import NotificationsList from "./NotificationsList";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications?limit=100");
        const body = await response.json();

        if (!response.ok) {
          throw new Error(getApiMessage(body, "Unable to load notifications."));
        }

        setNotifications(body.data ?? []);
        setUnreadCount(body.meta?.unreadCount ?? 0);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load notifications.",
        );
      }
    }

    void loadNotifications();
  }, []);

  return (
    <section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-5xl">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
          Track application updates, saved jobs, and job activity in one place.
        </p>
        <StatusNotice>{error}</StatusNotice>
        <NotificationsList
          key={`${notifications.length}-${unreadCount}`}
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
        />
      </div>
    </section>
  );
}
