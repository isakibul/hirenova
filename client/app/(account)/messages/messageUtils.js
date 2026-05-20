import { getRecordId } from "../../_lib/ui.js";

export function sortConversations(conversations = []) {
  return [...conversations].sort(
    (first, second) =>
      new Date(second.lastMessageAt ?? 0).getTime() -
      new Date(first.lastMessageAt ?? 0).getTime(),
  );
}

export function upsertConversation(conversations = [], updatedConversation) {
  if (!updatedConversation) {
    return conversations;
  }

  const updatedId = getRecordId(updatedConversation);
  const hasConversation = conversations.some(
    (conversation) => getRecordId(conversation) === updatedId,
  );

  return sortConversations(
    hasConversation
      ? conversations.map((conversation) =>
          getRecordId(conversation) === updatedId
            ? updatedConversation
            : conversation,
        )
      : [updatedConversation, ...conversations],
  );
}

export function removeConversationById(conversations = [], conversationId) {
  return conversations.filter(
    (conversation) => getRecordId(conversation) !== conversationId,
  );
}

export function markConversationRead(conversation) {
  return conversation ? { ...conversation, isUnread: false } : conversation;
}

export function markConversationReadById(conversations = [], conversationId) {
  return conversations.map((conversation) =>
    getRecordId(conversation) === conversationId
      ? markConversationRead(conversation)
      : conversation,
  );
}

export function getUnreadSignature(conversations = []) {
  return conversations
    .filter((conversation) => conversation.isUnread)
    .map(
      (conversation) =>
        `${getRecordId(conversation)}:${conversation.lastMessageAt ?? ""}`,
    )
    .sort()
    .join("|");
}
