import assert from "node:assert/strict";
import { test } from "node:test";

const notifications = await import("../app/(account)/notifications/notificationUtils.js");

test("notification helpers count and mark unread items", () => {
  const items = [
    { id: "one", readAt: "", isRead: false },
    { _id: "two", readAt: "2026-05-15T00:00:00.000Z", isRead: true },
  ];

  assert.equal(notifications.countUnreadNotifications(items), 1);

  const nextItems = notifications.markNotificationRead(
    items,
    "one",
    "2026-05-16T00:00:00.000Z",
  );

  assert.equal(nextItems[0].readAt, "2026-05-16T00:00:00.000Z");
  assert.equal(nextItems[0].isRead, true);
  assert.equal(nextItems[1], items[1]);
});

test("notification helpers mark all items and label types", () => {
  const nextItems = notifications.markAllNotificationsRead(
    [{ id: "one" }, { id: "two", readAt: "" }],
    "2026-05-16T00:00:00.000Z",
  );

  assert.deepEqual(
    nextItems.map((item) => item.readAt),
    ["2026-05-16T00:00:00.000Z", "2026-05-16T00:00:00.000Z"],
  );
  assert.equal(
    notifications.getNotificationTypeLabel("role_change_requested"),
    "Role request",
  );
  assert.equal(notifications.getNotificationTypeLabel("unknown"), "Update");
});
