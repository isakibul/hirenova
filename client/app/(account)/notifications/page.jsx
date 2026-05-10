import { authOptions } from "@lib/auth";
import { getFromBackend } from "@lib/backend";
import { getAuthHeaders } from "@lib/session";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import NotificationsList from "./NotificationsList";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const result = await getFromBackend("/notifications", {
    headers: getAuthHeaders(session.accessToken),
    params: {
      limit: 100,
    },
  });
  const notifications = result.ok ? (result.body.data ?? []) : [];
  const unreadCount = result.ok ? (result.body.meta?.unreadCount ?? 0) : 0;

  return (
    <section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-5xl">
        <div>
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Notifications
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Track application updates, saved jobs, and job activity in one
              place.
            </p>
          </div>
        </div>

        {!result.ok ? (
          <div className="site-danger mt-6 rounded-lg border px-4 py-3 text-sm">
            {result.body.error ??
              result.body.message ??
              "Unable to load notifications."}
          </div>
        ) : null}

        <NotificationsList
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
        />
      </div>
    </section>
  );
}
