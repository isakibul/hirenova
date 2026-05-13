"use client";

import ConfirmDialog from "@components/ConfirmDialog";
import Icon from "@components/Icon";
import { useAuth } from "@components/auth/AuthProvider";
import { acquireRealtimeSocket } from "@lib/realtime";
import {
  formatDateTime,
  formatPresence,
  getApiMessage,
  getCandidateProfileHref,
  getDisplayName,
  getOtherParticipant,
  getRecordId,
  isOnline,
} from "@lib/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function MessagesClient({ currentUserId, accessToken = "" }) {
  const { accessToken: authAccessToken, user } = useAuth();
  const effectiveAccessToken = accessToken || authAccessToken;
  const effectiveCurrentUserId = currentUserId || user?.id;
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("conversation");
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(requestedConversationId ?? "");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");
  const messagesPanelRef = useRef(null);
  const selectedIdRef = useRef(selectedId);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => getRecordId(conversation) === selectedId,
      ) ?? conversations[0],
    [conversations, selectedId],
  );

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/messages/conversations", {
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(getApiMessage(body, "Unable to load messages."));
      }
      const nextConversations = body.data ?? [];
      const nextSelectedId =
        requestedConversationId &&
        nextConversations.some(
          (conversation) =>
            getRecordId(conversation) === requestedConversationId,
        )
          ? requestedConversationId
          : getRecordId(nextConversations[0]);
      setConversations(
        nextConversations.map((conversation) =>
          getRecordId(conversation) === nextSelectedId
            ? { ...conversation, isUnread: false }
            : conversation,
        ),
      );
      setSelectedId(nextSelectedId);
      if (nextSelectedId) {
        fetch(`/api/messages/conversations/${nextSelectedId}`, {
          cache: "no-store",
        }).catch(() => undefined);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load messages.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestedConversationId]);

  const updateConversation = useCallback((updatedConversation) => {
    if (!updatedConversation) {
      return;
    }

    setConversations((current) => {
      const updatedId = getRecordId(updatedConversation);
      const hasConversation = current.some(
        (conversation) => getRecordId(conversation) === updatedId,
      );
      const nextConversations = (
        hasConversation
          ? current.map((conversation) =>
              getRecordId(conversation) === updatedId
                ? updatedConversation
                : conversation,
            )
          : [updatedConversation, ...current]
      ).sort(
        (first, second) =>
          new Date(second.lastMessageAt ?? 0).getTime() -
          new Date(first.lastMessageAt ?? 0).getTime(),
      );

      return nextConversations;
    });

    setSelectedId((currentSelectedId) =>
      currentSelectedId || selectedIdRef.current
        ? currentSelectedId
        : getRecordId(updatedConversation),
    );
  }, []);

  const removeConversation = useCallback((conversationId) => {
    setConversations((current) => {
      const nextConversations = current.filter(
        (conversation) => getRecordId(conversation) !== conversationId,
      );

      if (selectedIdRef.current === conversationId) {
        const nextSelectedId = getRecordId(nextConversations[0]);
        selectedIdRef.current = nextSelectedId;
        setSelectedId(nextSelectedId);
      }

      return nextConversations;
    });
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadConversations();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!effectiveAccessToken) {
      return undefined;
    }

    let ignore = false;
    const realtime = acquireRealtimeSocket(effectiveAccessToken);

    if (!realtime) {
      return undefined;
    }

    const { socket } = realtime;

    async function refreshConversations() {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await fetch("/api/messages/conversations", {
          cache: "no-store",
        });
        const body = await response.json();
        if (!ignore && response.ok) {
          setConversations(body.data ?? []);
        }
      } catch {
        // The existing REST load/error state handles visible failures.
      }
    }

    function handleConversationUpdated(payload) {
      const updatedConversation = payload?.conversation;
      const updatedId = getRecordId(updatedConversation);

      if (!updatedConversation || !updatedId) {
        return;
      }

      updateConversation(updatedConversation);

      if (selectedIdRef.current === updatedId) {
        fetch(`/api/messages/conversations/${updatedId}`, {
          cache: "no-store",
        })
          .then((response) => response.json())
          .then((body) => {
            if (body?.data) {
              updateConversation(body.data);
            }
          })
          .catch(() => undefined);
      }
    }

    function handleConversationDeleted(payload) {
      if (payload?.conversationId) {
        removeConversation(payload.conversationId);
      }
    }

    function handleVisibleAgain() {
      if (document.visibilityState === "visible") {
        void refreshConversations();
      }
    }

    function handleConnect() {
      void refreshConversations();
    }

    socket.on("connect", handleConnect);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("conversation:deleted", handleConversationDeleted);
    document.addEventListener("visibilitychange", handleVisibleAgain);
    if (socket.connected) {
      void refreshConversations();
    }

    return () => {
      ignore = true;
      socket.off("connect", handleConnect);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("conversation:deleted", handleConversationDeleted);
      realtime.release();
      document.removeEventListener("visibilitychange", handleVisibleAgain);
    };
  }, [effectiveAccessToken, removeConversation, updateConversation]);

  useEffect(() => {
    if (!selectedConversation) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (messagesPanelRef.current) {
        messagesPanelRef.current.scrollTop = messagesPanelRef.current.scrollHeight;
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedConversation]);

  async function openConversation(conversationId) {
    setSelectedId(conversationId);
    setConversations((current) =>
      current.map((conversation) =>
        getRecordId(conversation) === conversationId
          ? { ...conversation, isUnread: false }
          : conversation,
      ),
    );
    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}`,
        {
          cache: "no-store",
        },
      );
      const body = await response.json();
      if (response.ok && body.data) {
        setConversations((current) =>
          current.map((conversation) =>
            getRecordId(conversation) === conversationId
              ? body.data
              : conversation,
          ),
        );
      }
    } catch {
      // Keep the current inbox view usable if marking as read fails.
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const conversationId = getRecordId(selectedConversation);
    const bodyText = draft.trim();

    if (!conversationId || !bodyText) {
      return;
    }

    setIsSending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: bodyText }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(getApiMessage(body, "Unable to send message."));
      }
      setConversations((current) =>
        current
          .map((conversation) =>
            getRecordId(conversation) === conversationId
              ? body.data
              : conversation,
          )
          .sort(
            (first, second) =>
              new Date(second.lastMessageAt ?? 0).getTime() -
              new Date(first.lastMessageAt ?? 0).getTime(),
          ),
      );
      setSelectedId(conversationId);
      setDraft("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function deleteConversation() {
    const conversationId = getRecordId(selectedConversation);

    if (!conversationId) {
      return;
    }

    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(getApiMessage(body, "Unable to delete conversation."));
      }
      removeConversation(conversationId);
      setIsDeleteModalOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete conversation.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const selectedOther = getOtherParticipant(
    selectedConversation,
    effectiveCurrentUserId,
  );

  return (
    <section className="p-4">
      <div>
        {error ? (
          <div className="site-danger mb-4 rounded-lg border px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="grid h-[calc(100vh-5.5rem)] min-h-[620px] gap-4 lg:grid-cols-[340px_1fr]">
          <aside className="site-border site-card overflow-hidden rounded-lg border">
            <div className="site-panel border-b border-[var(--site-border)] px-4 py-3">
              <p className="text-sm font-semibold">Conversations</p>
            </div>
            <div className="h-[calc(100%-49px)] overflow-y-auto">
              {isLoading ? (
                <div className="site-muted p-4 text-sm">Loading inbox...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-sm">
                  <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                    <Icon name="file" />
                  </div>
                  <p className="mt-3 font-semibold">No messages yet</p>
                  <p className="site-muted mt-1 leading-6">
                    Conversations will appear here after a message is sent.
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const conversationId = getRecordId(conversation);
                  const other = getOtherParticipant(conversation, effectiveCurrentUserId);
                  const isSelected =
                    conversationId === getRecordId(selectedConversation);
                  return (
                    <button
                      key={conversationId}
                      type="button"
                      onClick={() => openConversation(conversationId)}
                      className={`block w-full border-b border-[var(--site-border)] px-4 py-3 text-left transition hover:bg-[var(--site-panel)] ${
                        isSelected ? "bg-[var(--site-panel)]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {getDisplayName(other)}
                          </p>
                          <p className="site-muted mt-1 line-clamp-2 text-xs leading-5">
                            {conversation.lastMessage || "Conversation started"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {conversation.isUnread ? (
                            <span className="site-badge rounded px-2 py-1 text-[10px] font-semibold">
                              New
                            </span>
                          ) : null}
                          <p className="site-muted mt-1 text-[11px]">
                            {formatDateTime(conversation.lastMessageAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="site-border site-card flex min-h-0 flex-col overflow-hidden rounded-lg border">
            <div className="site-panel flex items-center justify-between gap-3 border-b border-[var(--site-border)] px-4 py-3">
              <div className="min-w-0">
                {selectedOther && getCandidateProfileHref(selectedOther) ? (
                  <Link
                    href={getCandidateProfileHref(selectedOther)}
                    className="font-semibold transition hover:text-[var(--site-accent)]"
                  >
                    {getDisplayName(selectedOther)}
                  </Link>
                ) : (
                  <p className="font-semibold">
                    {selectedOther
                      ? getDisplayName(selectedOther)
                      : "Select a conversation"}
                  </p>
                )}
                {selectedOther ? (
                  <div className="site-muted mt-1 flex items-center gap-1.5 text-xs">
                    <span>{selectedOther.role} ·</span>
                    <span className="inline-flex items-center gap-1.5">
                      {isOnline(selectedOther.lastSeenAt) ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      ) : null}
                      {formatPresence(selectedOther.lastSeenAt)}
                    </span>
                  </div>
                ) : null}
              </div>
              {selectedConversation ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  className="site-border site-field inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
                  aria-label="Delete conversation"
                  title="Delete conversation"
                >
                  <Icon name="trash" />
                </button>
              ) : null}
            </div>

            <div
              ref={messagesPanelRef}
              className="flex-1 space-y-3 overflow-y-auto p-4"
            >
              {!selectedConversation ? (
                <div className="site-muted text-sm">
                  Choose a conversation to start chatting.
                </div>
              ) : selectedConversation.messages?.length ? (
                selectedConversation.messages.map((message) => {
                  const mine = String(message.sender) === effectiveCurrentUserId;
                  return (
                    <div
                      key={message.id ?? message._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg border px-3 py-2 text-sm leading-6 ${
                          mine ? "site-badge" : "site-border site-panel"
                        }`}
                      >
                        <p>{message.body}</p>
                        <p className="mt-1 text-[11px] opacity-75">
                          {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="site-muted text-sm">
                  No messages in this conversation yet.
                </div>
              )}
            </div>

            <form
              onSubmit={sendMessage}
              className="border-t border-[var(--site-border)] p-3"
            >
              <div className="flex gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="site-field min-h-11 flex-1 resize-y rounded-md border px-3 py-2 text-sm focus:outline-none"
                  maxLength={3000}
                  placeholder="Write a message..."
                  disabled={!selectedConversation}
                />
                <button
                  type="submit"
                  disabled={isSending || !selectedConversation || !draft.trim()}
                  className="site-button rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {isSending ? "Sending" : "Send"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
      {isDeleteModalOpen ? (
        <ConfirmDialog
          title="Delete conversation?"
          icon="trash"
          tone="danger"
          confirmLabel="Delete"
          pendingLabel="Deleting"
          isPending={isDeleting}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={deleteConversation}
        >
          This will remove the conversation from your inbox only.
        </ConfirmDialog>
      ) : null}
    </section>
  );
}
