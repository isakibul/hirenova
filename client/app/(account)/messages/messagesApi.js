import { requestJson } from "../../_lib/clientApi.js";

export function listConversations(init = {}) {
  return requestJson(
    "/messages/conversations",
    { cache: "no-store", ...init },
    "Unable to load messages.",
  );
}

export function getConversation(conversationId, init = {}) {
  return requestJson(`/messages/conversations/${conversationId}`, {
    cache: "no-store",
    ...init,
  });
}

export function sendConversationMessage(conversationId, body) {
  return requestJson(
    `/messages/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
    "Unable to send message.",
  );
}

export function deleteConversationById(conversationId) {
  return requestJson(
    `/messages/conversations/${conversationId}`,
    {
      method: "DELETE",
    },
    "Unable to delete conversation.",
  );
}
