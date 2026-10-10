"use client";

import Icon from "../Icon";

export default function MessageBellButton({ isOpen, onClick, unreadCount }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
  );
}
