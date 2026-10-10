"use client";

import Link from "next/link";
import {
  formatDateTime,
  formatPresence,
  getCandidateProfileHref,
  getDisplayName,
  getOtherParticipant,
  getRecordId,
  isOnline,
} from "@lib/ui";
import Icon from "../Icon";
import LoadingCircle from "../LoadingCircle";
import Modal from "../Modal";
import { RowListSkeleton } from "../Skeleton";

function ConversationList({
  conversations,
  currentUserId,
  isLoading,
  onOpenConversation,
  selectedConversation,
}) {
  if (isLoading) {
    return <RowListSkeleton count={4} />;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-sm">
        <div className="site-badge inline-flex h-10 w-10 items-center justify-center rounded-md">
          <Icon name="message" />
        </div>
        <p className="mt-3 font-semibold">No messages yet</p>
        <p className="site-muted mt-1 leading-6">
          Conversations will appear here after a message is sent.
        </p>
      </div>
    );
  }

  return conversations.map((conversation) => {
    const conversationId = getRecordId(conversation);
    const other = getOtherParticipant(conversation, currentUserId);
    const isSelected = conversationId === getRecordId(selectedConversation);

    return (
      <button
        key={conversationId}
        type="button"
        onClick={() => onOpenConversation(conversationId)}
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
              {conversation.lastMessage || "Conversation started"}
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
  });
}

function ConversationHeader({
  isDeleting,
  onClose,
  onDelete,
  selectedConversation,
  selectedOther,
}) {
  return (
    <div className="site-panel flex items-center justify-between gap-3 border-b border-(--site-border) px-4 py-3">
      <div className="min-w-0">
        {selectedOther && getCandidateProfileHref(selectedOther) ? (
          <Link
            href={getCandidateProfileHref(selectedOther)}
            onClick={onClose}
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
          onClick={onDelete}
          disabled={isDeleting}
          className="site-border site-field inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
          aria-label="Delete conversation"
          title="Delete conversation"
        >
          <Icon name="trash" />
        </button>
      ) : null}
    </div>
  );
}

function MessageThread({ currentUserId, messagesPanelRef, selectedConversation }) {
  return (
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
  );
}

function MessageComposer({
  draft,
  isSending,
  onDraftChange,
  onSend,
  selectedConversation,
}) {
  return (
    <form onSubmit={onSend} className="border-t border-(--site-border) p-3">
      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          className="site-field min-h-11 flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none"
          maxLength={3000}
          placeholder="Write a message..."
          disabled={!selectedConversation}
        />
        <button
          type="submit"
          disabled={isSending || !selectedConversation || !draft.trim()}
          className="site-button inline-flex min-w-16 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {isSending ? (
            <LoadingCircle className="h-3.5 w-3.5" label="Sending message" />
          ) : null}
          {isSending ? "Sending" : "Send"}
        </button>
      </div>
    </form>
  );
}

export default function MessagesMenuPanel({
  conversations,
  currentUserId,
  draft,
  error,
  isDeleting,
  isLoading,
  isSending,
  messagesPanelRef,
  onClose,
  onDelete,
  onDraftChange,
  onOpenConversation,
  onSend,
  selectedConversation,
  selectedOther,
}) {
  return (
    <Modal
      ariaLabelledBy="messages-modal-title"
      isModal={false}
      onClose={onClose}
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
            onClick={onClose}
            className="site-border site-field inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:border-(--site-accent) hover:text-(--site-accent)"
            aria-label="Open messages full screen"
            title="Open full screen"
          >
            <Icon name="fullscreen" />
          </Link>
          <button
            type="button"
            onClick={onClose}
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
            <ConversationList
              conversations={conversations}
              currentUserId={currentUserId}
              isLoading={isLoading}
              onOpenConversation={onOpenConversation}
              selectedConversation={selectedConversation}
            />
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <ConversationHeader
            isDeleting={isDeleting}
            onClose={onClose}
            onDelete={onDelete}
            selectedConversation={selectedConversation}
            selectedOther={selectedOther}
          />
          <MessageThread
            currentUserId={currentUserId}
            messagesPanelRef={messagesPanelRef}
            selectedConversation={selectedConversation}
          />
          <MessageComposer
            draft={draft}
            isSending={isSending}
            onDraftChange={onDraftChange}
            onSend={onSend}
            selectedConversation={selectedConversation}
          />
        </section>
      </div>
    </Modal>
  );
}
