"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { acquireRealtimeSocket } from "../_lib/realtime";
import {
  getCaughtErrorMessage,
  getOtherParticipant,
  getRecordId,
} from "../_lib/ui";
import {
  deleteConversationById,
  getConversation,
  listConversations,
  sendConversationMessage,
} from "../(account)/messages/messagesApi";
import {
  getUnreadSignature,
  markConversationRead,
  markConversationReadById,
  removeConversationById,
  upsertConversation,
} from "../(account)/messages/messageUtils";
import ConfirmDialog from "./ConfirmDialog";
import MessageBellButton from "./messages-menu/MessageBellButton";
import MessagesMenuPanel from "./messages-menu/MessagesMenuPanel";

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
        (conversation) => getRecordId(conversation) === selectedId,
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
        const nextConversations = upsertConversation(current, updatedConversation);

        rememberUnreadState(nextConversations);
        return nextConversations;
      });
    },
    [rememberUnreadState],
  );

  const removeConversation = useCallback(
    (conversationId) => {
      setConversations((current) => {
        const nextConversations = removeConversationById(current, conversationId);

        if (selectedIdRef.current === conversationId) {
          const nextSelectedId = getRecordId(nextConversations[0]);
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
    const body = await listConversations();

    const nextConversations = body.data ?? [];
    const nextSelectedId =
      selectedId &&
      nextConversations.some(
        (conversation) => getRecordId(conversation) === selectedId,
      )
        ? selectedId
        : getRecordId(nextConversations[0]);

    setSelectedId(nextSelectedId);

    if (markSelectedRead && nextSelectedId) {
      getConversation(nextSelectedId).catch(() => undefined);
    }

    const mappedConversations = nextConversations.map((conversation) =>
      markSelectedRead && getRecordId(conversation) === nextSelectedId
        ? markConversationRead(conversation)
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
        getCaughtErrorMessage(caughtError, "Unable to load messages."),
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
    if (!enabled) {
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
        const body = await listConversations();
        if (!ignore) {
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
      const updatedId = getRecordId(updatedConversation);

      if (!updatedConversation || !updatedId) {
        return;
      }

      updateConversation(updatedConversation);

      if (isOpenRef.current && selectedIdRef.current === updatedId) {
        getConversation(updatedId)
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
      markConversationReadById(current, conversationId),
    );
    try {
      const body = await getConversation(conversationId);
      if (body.data) {
        setConversations((current) =>
          current.map((conversation) =>
            getRecordId(conversation) === conversationId
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
    const conversationId = getRecordId(selectedConversation);
    const bodyText = draft.trim();

    if (!conversationId || !bodyText) {
      return;
    }

    setIsSending(true);
    setError("");
    try {
      const body = await sendConversationMessage(conversationId, bodyText);
      setConversations((current) => upsertConversation(current, body.data));
      setSelectedId(conversationId);
      setDraft("");
    } catch (caughtError) {
      setError(
        getCaughtErrorMessage(caughtError, "Unable to send message."),
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
      await deleteConversationById(conversationId);
      removeConversation(conversationId);
      setIsDeleteModalOpen(false);
    } catch (caughtError) {
      setError(
        getCaughtErrorMessage(caughtError, "Unable to delete conversation."),
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
      <MessageBellButton
        isOpen={isOpen}
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            void loadConversations();
          }
        }}
        unreadCount={unreadCount}
      />

      {isOpen ? (
        <MessagesMenuPanel
          conversations={conversations}
          currentUserId={currentUserId}
          draft={draft}
          error={error}
          isDeleting={isDeleting}
          isLoading={isLoading}
          isSending={isSending}
          messagesPanelRef={messagesPanelRef}
          onClose={() => setIsOpen(false)}
          onDelete={() => setIsDeleteModalOpen(true)}
          onDraftChange={setDraft}
          onOpenConversation={openConversation}
          onSend={sendMessage}
          selectedConversation={selectedConversation}
          selectedOther={selectedOther}
        />
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
