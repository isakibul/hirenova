"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { acquireRealtimeSocket } from "../_lib/realtime";
import ConfirmDialog from "./ConfirmDialog";
import Icon from "./Icon";
import Modal from "./Modal";

function getMessage(body, fallback) {
  return body?.error ?? body?.message ?? fallback;
}

function getConversationId(conversation) {
  return conversation?.id ?? conversation?._id ?? "";
}

function getUserId(user) {
  return user?.id ?? user?._id ?? "";
}

function getDisplayName(user) {
  return user?.username || user?.email || "User";
}

function getOtherParticipant(conversation, currentUserId) {
  return conversation?.participants?.find(
    (participant) => getUserId(participant) !== currentUserId,
  );
}

function getProfileHref(user) {
  const userId = getUserId(user);
  return user?.role === "jobseeker" && userId
    ? `/candidates?candidate=${userId}`
    : "";
}

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

function formatPresence(value) {
  if (!value) {
    return "Last seen not available";
  }

  const lastSeen = new Date(value);
  const diffMs = Date.now() - lastSeen.getTime();

  if (diffMs < 2 * 60 * 1000) {
    return "Online";
  }
  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `Last seen ${minutes} min ago`;
  }
  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
    return `Last seen ${hours} hr ago`;
  }

  return `Last seen ${formatTime(value)}`;
}

function isOnline(value) {
  return value ? Date.now() - new Date(value).getTime() < 2 * 60 * 1000 : false;
}

function getUnreadSignature(conversations = []) {
  return conversations
    .filter((conversation) => conversation.isUnread)
    .map(
      (conversation) =>
        `${getConversationId(conversation)}:${conversation.lastMessageAt ?? ""}`,
    )
    .sort()
    .join("|");
}

export default function MessagesMenu({
  enabled = false,
  currentUserId = "",
  accessToken = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");
  const audioContextRef = useRef(null);
  const messagesPanelRef = useRef(null);
  const isOpenRef = useRef(false);
  const selectedIdRef = useRef("");
  const soundReadyRef = useRef(false);
  const unreadSignatureRef = useRef("");
  const hasLoadedUnreadRef = useRef(false);

  const unreadCount = conversations.filter(
    (conversation) => conversation.isUnread,
  ).length;
  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => getConversationId(conversation) === selectedId,
      ) ?? conversations[0],
    [conversations, selectedId],
  );
  const selectedOther = getOtherParticipant(
    selectedConversation,
    currentUserId,
  );

  const unlockSound = useCallback(() => {
    if (soundReadyRef.current || typeof window === "undefined") {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }

    audioContextRef.current = audioContextRef.current ?? new AudioContext();
    audioContextRef.current.resume().catch(() => undefined);
    soundReadyRef.current = true;
  }, []);

  const playMessageSound = useCallback(() => {
    if (!soundReadyRef.current || !audioContextRef.current) {
      return;
    }

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startAt);
    oscillator.frequency.setValueAtTime(660, startAt + 0.09);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.22);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.24);
  }, []);

  const rememberUnreadState = useCallback(
    (nextConversations, { allowSound = true } = {}) => {
      const nextSignature = getUnreadSignature(nextConversations);

      if (
        allowSound &&
        hasLoadedUnreadRef.current &&
        nextSignature &&
        nextSignature !== unreadSignatureRef.current
      ) {
        playMessageSound();
      }

      unreadSignatureRef.current = nextSignature;
      hasLoadedUnreadRef.current = true;
    },
    [playMessageSound],
  );

  const updateConversation = useCallback(
    (updatedConversation) => {
      if (!updatedConversation) {
        return;
      }

      setConversations((current) => {
        const updatedId = getConversationId(updatedConversation);
        const hasConversation = current.some(
          (conversation) => getConversationId(conversation) === updatedId,
        );
        const nextConversations = (
          hasConversation
            ? current.map((conversation) =>
                getConversationId(conversation) === updatedId
                  ? updatedConversation
                  : conversation,
              )
            : [updatedConversation, ...current]
        ).sort(
          (first, second) =>
            new Date(second.lastMessageAt ?? 0).getTime() -
            new Date(first.lastMessageAt ?? 0).getTime(),
        );

        rememberUnreadState(nextConversations);
        return nextConversations;
      });
    },
    [rememberUnreadState],
  );

  const removeConversation = useCallback(
    (conversationId) => {
      setConversations((current) => {
        const nextConversations = current.filter(
          (conversation) => getConversationId(conversation) !== conversationId,
        );

        if (selectedIdRef.current === conversationId) {
          const nextSelectedId = getConversationId(nextConversations[0]);
          selectedIdRef.current = nextSelectedId;
          setSelectedId(nextSelectedId);
        }

        rememberUnreadState(nextConversations, { allowSound: false });
        return nextConversations;
      });
    },
    [rememberUnreadState],
  );

  async function refreshConversations({ markSelectedRead = false } = {}) {
    const response = await fetch("/api/messages/conversations", {
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(getMessage(body, "Unable to load messages."));
    }

    const nextConversations = body.data ?? [];
    const nextSelectedId =
      selectedId &&
      nextConversations.some(
        (conversation) => getConversationId(conversation) === selectedId,
      )
        ? selectedId
        : getConversationId(nextConversations[0]);

    setSelectedId(nextSelectedId);

    if (markSelectedRead && nextSelectedId) {
      fetch(`/api/messages/conversations/${nextSelectedId}`, {
        cache: "no-store",
      }).catch(() => undefined);
    }

    const mappedConversations = nextConversations.map((conversation) =>
      markSelectedRead && getConversationId(conversation) === nextSelectedId
        ? { ...conversation, isUnread: false }
        : conversation,
    );
    rememberUnreadState(mappedConversations, { allowSound: false });
    setConversations(mappedConversations);
  }

  async function loadConversations() {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await refreshConversations({ markSelectedRead: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load messages.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function handleInteraction() {
      unlockSound();
    }

    document.addEventListener("pointerdown", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      document.removeEventListener("pointerdown", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [enabled, unlockSound]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!enabled || !accessToken) {
      return undefined;
    }

    let ignore = false;
    const realtime = acquireRealtimeSocket(accessToken);

    if (!realtime) {
      return undefined;
    }

    const { socket } = realtime;

    async function refreshInitialConversations({ allowSound = false } = {}) {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await fetch("/api/messages/conversations", {
          cache: "no-store",
        });
        const body = await response.json();
        if (!ignore && response.ok) {
          const nextConversations = body.data ?? [];
          rememberUnreadState(nextConversations, { allowSound });
          setConversations(nextConversations);
        }
      } catch {
        // Keep the nav quiet if a realtime refresh fails.
      }
    }

    function handleConversationUpdated(payload) {
      const updatedConversation = payload?.conversation;
      const updatedId = getConversationId(updatedConversation);

      if (!updatedConversation || !updatedId) {
        return;
      }

      updateConversation(updatedConversation);

      if (isOpenRef.current && selectedIdRef.current === updatedId) {
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
        void refreshInitialConversations({ allowSound: true });
      }
    }

    function handleConnect() {
      void refreshInitialConversations();
    }

    socket.on("connect", handleConnect);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("conversation:deleted", handleConversationDeleted);
    document.addEventListener("visibilitychange", handleVisibleAgain);
    if (socket.connected) {
      void refreshInitialConversations();
    }

    return () => {
      ignore = true;
      socket.off("connect", handleConnect);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("conversation:deleted", handleConversationDeleted);
      realtime.release();
      document.removeEventListener("visibilitychange", handleVisibleAgain);
    };
  }, [
    accessToken,
    enabled,
    rememberUnreadState,
    removeConversation,
    updateConversation,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedConversation) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (messagesPanelRef.current) {
        messagesPanelRef.current.scrollTop =
          messagesPanelRef.current.scrollHeight;
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen, selectedConversation]);

  async function openConversation(conversationId) {
    setSelectedId(conversationId);
    setConversations((current) =>
      current.map((conversation) =>
        getConversationId(conversation) === conversationId
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
            getConversationId(conversation) === conversationId
              ? body.data
              : conversation,
          ),
        );
      }
    } catch {
      /**
       * Leave the local conversation selected if marking read fails.
       */
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const conversationId = getConversationId(selectedConversation);
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
        throw new Error(getMessage(body, "Unable to send message."));
      }
      setConversations((current) =>
        current
          .map((conversation) =>
            getConversationId(conversation) === conversationId
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
    const conversationId = getConversationId(selectedConversation);

    if (!conversationId) {
      return;
    }

    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}`,
        {
          method: "DELETE",
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(getMessage(body, "Unable to delete conversation."));
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

  if (!enabled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            void loadConversations();
          }
        }}
        className="site-border site-panel relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-(--site-accent) hover:text-(--site-accent)"
        aria-label="Open messages"
        aria-expanded={isOpen}
      >
        <Icon name="message" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--site-button-bg) px-1 text-[10px] font-bold text-(--site-button-fg)">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <Modal
          ariaLabelledBy="messages-modal-title"
          isModal={false}
          onClose={() => setIsOpen(false)}
          overlayClassName="bg-transparent"
          panelClassName="site-elevated flex h-[min(620px,82vh)] max-w-3xl flex-col overflow-hidden"
          position="top"
        >
            <div className="flex items-center justify-between gap-3 border-b border-(--site-border) px-4 py-3">
              <div>
                <h2 id="messages-modal-title" className="font-semibold">
                  Inbox
                </h2>
                <p className="site-muted mt-0.5 text-xs">
                  Recent hiring conversations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/messages"
                  onClick={() => setIsOpen(false)}
                  className="site-border site-field inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:border-(--site-accent) hover:text-(--site-accent)"
                  aria-label="Open messages full screen"
                  title="Open full screen"
                >
                  <Icon name="fullscreen" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="site-border site-field inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:border-(--site-accent) hover:text-(--site-accent)"
                  aria-label="Close messages"
                >
                  <Icon name="x" />
                </button>
              </div>
            </div>

            {error ? (
              <div className="site-danger mx-4 mt-4 rounded-md border px-3 py-2 text-sm">
                {error}
              </div>
            ) : null}

            <div className="grid min-h-0 flex-1 md:grid-cols-[240px_1fr]">
              <aside className="min-h-0 border-b border-(--site-border) md:border-b-0 md:border-r">
                <div className="max-h-44 overflow-y-auto md:max-h-full">
                  {isLoading ? (
                    <div className="site-muted p-4 text-sm">
                      Loading inbox...
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-sm">
                      <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
                        <Icon name="message" />
                      </div>
                      <p className="mt-3 font-semibold">No messages yet</p>
                      <p className="site-muted mt-1 leading-6">
                        Conversations will appear here after a message is sent.
                      </p>
                    </div>
                  ) : (
                    conversations.map((conversation) => {
                      const conversationId = getConversationId(conversation);
                      const other = getOtherParticipant(
                        conversation,
                        currentUserId,
                      );
                      const isSelected =
                        conversationId ===
                        getConversationId(selectedConversation);
                      return (
                        <button
                          key={conversationId}
                          type="button"
                          onClick={() => openConversation(conversationId)}
                          className={`block w-full border-b border-(--site-border) px-4 py-3 text-left transition hover:bg-(--site-panel) ${
                            isSelected ? "bg-(--site-panel)" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {getDisplayName(other)}
                              </p>
                              <p className="site-muted mt-1 line-clamp-2 text-xs leading-5">
                                {conversation.lastMessage ||
                                  "Conversation started"}
                              </p>
                            </div>
                            {conversation.isUnread ? (
                              <span className="site-badge shrink-0 rounded px-2 py-1 text-[10px] font-semibold">
                                New
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              <section className="flex min-h-0 flex-col">
                <div className="site-panel flex items-center justify-between gap-3 border-b border-(--site-border) px-4 py-3">
                  <div className="min-w-0">
                    {selectedOther && getProfileHref(selectedOther) ? (
                      <Link
                        href={getProfileHref(selectedOther)}
                        onClick={() => setIsOpen(false)}
                        className="font-semibold transition hover:text-(--site-accent)"
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
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
                >
                  {!selectedConversation ? (
                    <div className="site-muted text-sm">
                      Choose a conversation to start chatting.
                    </div>
                  ) : selectedConversation.messages?.length ? (
                    selectedConversation.messages.map((message) => {
                      const mine = String(message.sender) === currentUserId;
                      return (
                        <div
                          key={message.id ?? message._id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[82%] rounded-lg border px-3 py-2 text-sm leading-6 ${
                              mine ? "site-badge" : "site-border site-panel"
                            }`}
                          >
                            <p>{message.body}</p>
                            <p className="mt-1 text-[11px] opacity-75">
                              {formatTime(message.createdAt)}
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
                  className="border-t border-(--site-border) p-3"
                >
                  <div className="flex gap-2">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      className="site-field min-h-11 flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none"
                      maxLength={3000}
                      placeholder="Write a message..."
                      disabled={!selectedConversation}
                    />
                    <button
                      type="submit"
                      disabled={
                        isSending || !selectedConversation || !draft.trim()
                      }
                      className="site-button rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {isSending ? "Sending" : "Send"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
        </Modal>
      ) : null}

      {isDeleteModalOpen && typeof document !== "undefined"
        ? createPortal(
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
            </ConfirmDialog>,
            document.body,
          )
        : null}
    </>
  );
}
