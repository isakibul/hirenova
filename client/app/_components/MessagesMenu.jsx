"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";

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

export default function MessagesMenu({ enabled = false, currentUserId = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const audioContextRef = useRef(null);
  const messagesPanelRef = useRef(null);
  const soundReadyRef = useRef(false);
  const unreadSignatureRef = useRef("");
  const hasLoadedUnreadRef = useRef(false);

  const unreadCount = conversations.filter((conversation) => conversation.isUnread).length;
  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => getConversationId(conversation) === selectedId,
      ) ?? conversations[0],
    [conversations, selectedId],
  );
  const selectedOther = getOtherParticipant(selectedConversation, currentUserId);

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
    if (!enabled) {
      return undefined;
    }

    let ignore = false;
    let isRefreshing = false;

    async function refreshUnread() {
      if (isRefreshing) {
        return;
      }
      isRefreshing = true;
      try {
        if (isOpen && selectedId) {
          const response = await fetch(`/api/messages/conversations/${selectedId}`, {
            cache: "no-store",
          });
          const body = await response.json();
          if (!ignore && response.ok && body.data) {
            setConversations((current) => {
              const nextConversations = current.map((conversation) =>
                getConversationId(conversation) === selectedId
                  ? body.data
                  : conversation,
              );
              rememberUnreadState(nextConversations);
              return nextConversations;
            });
          }
        } else {
          const response = await fetch("/api/messages/conversations", {
            cache: "no-store",
          });
          const body = await response.json();
          if (!ignore && response.ok) {
            const nextConversations = body.data ?? [];
            rememberUnreadState(nextConversations);
            setConversations(nextConversations);
          }
        }
      } catch {
        // Keep the nav quiet if a session expires mid-request.
      } finally {
        isRefreshing = false;
      }
    }

    refreshUnread();
    const intervalId = window.setInterval(refreshUnread, 5000);
    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, isOpen, selectedId, rememberUnreadState]);

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
        messagesPanelRef.current.scrollTop = messagesPanelRef.current.scrollHeight;
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
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        cache: "no-store",
      });
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
      // Leave the local conversation selected if marking read fails.
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
        className="site-border site-panel relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
        aria-label="Open messages"
        aria-expanded={isOpen}
      >
        <Icon name="message" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--site-button-bg)] px-1 text-[10px] font-bold text-[var(--site-button-fg)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 py-16"
          role="dialog"
          aria-modal="false"
          aria-labelledby="messages-modal-title"
          onMouseDown={() => setIsOpen(false)}
        >
          <div
            className="site-border site-card site-elevated flex h-[min(620px,82vh)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--site-border)] px-4 py-3">
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
                  className="site-border site-field inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
                  aria-label="Open messages full screen"
                  title="Open full screen"
                >
                  <Icon name="fullscreen" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="site-border site-field inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
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
              <aside className="min-h-0 border-b border-[var(--site-border)] md:border-b-0 md:border-r">
                <div className="max-h-44 overflow-y-auto md:max-h-full">
                  {isLoading ? (
                    <div className="site-muted p-4 text-sm">Loading inbox...</div>
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
                        conversationId === getConversationId(selectedConversation);
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
                <div className="site-panel border-b border-[var(--site-border)] px-4 py-3">
                  {selectedOther && getProfileHref(selectedOther) ? (
                    <Link
                      href={getProfileHref(selectedOther)}
                      onClick={() => setIsOpen(false)}
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
                    <div className="site-muted mt-1 flex items-center gap-1.5 text-xs capitalize">
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
                  className="border-t border-[var(--site-border)] p-3"
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
          </div>
        </div>
      ) : null}
    </>
  );
}
