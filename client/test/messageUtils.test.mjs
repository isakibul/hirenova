import assert from "node:assert/strict";
import { test } from "node:test";

const messageUtils = await import("../app/(account)/messages/messageUtils.js");

test("message utilities sort, upsert, and remove conversations", () => {
  const older = { id: "older", lastMessageAt: "2026-01-01T00:00:00.000Z" };
  const newer = { id: "newer", lastMessageAt: "2026-01-02T00:00:00.000Z" };

  assert.deepEqual(messageUtils.sortConversations([older, newer]), [newer, older]);
  assert.deepEqual(
    messageUtils.upsertConversation([older], newer).map((item) => item.id),
    ["newer", "older"],
  );
  assert.deepEqual(
    messageUtils
      .upsertConversation([older, newer], {
        id: "older",
        lastMessageAt: "2026-01-03T00:00:00.000Z",
      })
      .map((item) => item.id),
    ["older", "newer"],
  );
  assert.deepEqual(messageUtils.removeConversationById([older, newer], "older"), [
    newer,
  ]);
});

test("message utilities mark read state and build unread signatures", () => {
  const conversations = [
    { id: "a", isUnread: true, lastMessageAt: "2026-01-01T00:00:00.000Z" },
    { id: "b", isUnread: false, lastMessageAt: "2026-01-02T00:00:00.000Z" },
    { _id: "c", isUnread: true },
  ];

  assert.deepEqual(messageUtils.markConversationRead({ id: "a", isUnread: true }), {
    id: "a",
    isUnread: false,
  });
  assert.deepEqual(
    messageUtils.markConversationReadById(conversations, "a")[0].isUnread,
    false,
  );
  assert.equal(
    messageUtils.getUnreadSignature(conversations),
    "a:2026-01-01T00:00:00.000Z|c:",
  );
});
