"use client";

import { useAuth } from "@components/auth/AuthProvider";
import { requestJson } from "@lib/clientApi";
import { getApiMessage } from "@lib/ui";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi, I am HireNova Assistant. Ask me how to use jobs, profiles, applications, resumes, admin tools, or newsletter features.",
};

function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6 ${
          isUser
            ? "site-button"
            : "site-border site-panel border text-[var(--site-fg)]"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function AssistantChat() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const isMessagesPage = pathname === "/messages";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [isOpen, messages]);

  if (isMessagesPage) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextInput = input.trim();

    if (!nextInput || isSending) {
      return;
    }

    const nextMessages = [
      ...messages,
      {
        role: "user",
        content: nextInput,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const body = await requestJson(
        "/api/assistant/chat",
        {
          method: "POST",
          body: JSON.stringify({
            messages: nextMessages
              .filter((message) => message !== welcomeMessage)
              .slice(-8),
            context: {
              path: pathname,
              role: user?.role ?? "",
              isAuthenticated,
            },
          }),
        },
        "Unable to reach HireNova Assistant.",
      );
      const answer = body.data?.answer ?? getApiMessage(body, "");

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer || "I could not generate an answer right now.",
        },
      ]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reach HireNova Assistant.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-30">
      {isOpen ? (
        <section className="site-border site-card mb-3 flex h-[min(36rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border">
          <div className="site-panel flex items-start justify-between gap-3 border-b border-[var(--site-border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">HireNova Assistant</p>
              <p className="site-muted mt-1 text-xs">
                System help for HireNova
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="site-border site-field inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border"
              aria-label="Close assistant"
            >
              <Icon name="x" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} message={message} />
            ))}
            {isSending ? (
              <div className="flex justify-start">
                <div className="site-border site-panel border rounded-lg px-3 py-2 text-sm">
                  Thinking...
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {error ? (
            <p className="site-danger mx-4 mb-3 rounded-md border px-3 py-2 text-xs">
              {error}
            </p>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--site-border)] p-3"
          >
            <label htmlFor="assistant-message" className="sr-only">
              Ask HireNova Assistant
            </label>
            <div className="flex gap-2">
              <input
                id="assistant-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="site-field min-h-10 flex-1 rounded-md border px-3 text-sm focus:outline-none"
                placeholder="Ask about HireNova..."
                maxLength={900}
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="site-button inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold disabled:opacity-70"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="site-button inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold shadow-lg"
        aria-expanded={isOpen}
        aria-label="Open HireNova Assistant"
      >
        <Icon name="message" />
        Assistant
      </button>
    </div>
  );
}
