"use client";

import { useAuth } from "@components/auth/AuthProvider";
import { requestJson } from "@lib/clientApi";
import { getApiMessage } from "@lib/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import LoadingCircle from "./LoadingCircle";

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi, I am HireNova Assistant. Ask me how to use jobs, profiles, applications, resumes, admin tools, or newsletter features.",
};

const pageAssistantGuides = [
  {
    match: (path) => path === "/jobs",
    title: "Browse Jobs",
    actions: ["Search jobs", "Filter jobs", "Open job details"],
    prompts: ["How do I filter jobs?", "How do I apply for a job?"],
  },
  {
    match: (path) => /^\/jobs\/[^/]+$/.test(path),
    title: "Job Details",
    actions: ["Save job", "Apply for job", "Review job details"],
    prompts: ["How do I apply here?", "Why can I not apply?"],
  },
  {
    match: (path) => path === "/profile",
    title: "Profile",
    actions: ["Edit profile", "Parse resume", "Update password"],
    prompts: ["How do I parse my resume?", "How do I update my password?"],
  },
  {
    match: (path) => path === "/manage-jobs",
    title: "Manage Jobs",
    actions: [
      "Create job",
      "Edit job",
      "Review applicants",
      "Approve or decline",
      "View history",
    ],
    links: [
      { label: "Pending jobs", href: "/manage-jobs?approval_status=pending" },
      { label: "System monitor", href: "/system-monitor" },
    ],
    prompts: ["How do approvals work?", "How do I review applicants?"],
  },
  {
    match: (path) => /^\/manage-jobs\/[^/]+\/applications$/.test(path),
    title: "Job Applicants",
    actions: ["Review applicants", "Update application status"],
    prompts: ["How do I update an applicant?", "What do statuses mean?"],
  },
  {
    match: (path) => path === "/manage-users",
    title: "Manage Users",
    actions: ["Create user", "Change role", "Suspend or activate", "Delete user"],
    prompts: ["How do role changes work?", "Why is a user action disabled?"],
  },
  {
    match: (path) => path === "/candidates",
    title: "Candidates",
    actions: ["Search candidates", "Open profile", "Start conversation"],
    prompts: ["How do I contact a candidate?", "Who appears here?"],
  },
  {
    match: (path) => path === "/manage-newsletter",
    title: "Manage Newsletter",
    actions: ["Search subscribers", "Filter statuses", "Delete subscriber"],
    links: [{ label: "Email delivery", href: "/system-monitor" }],
    prompts: ["Where do subscribers come from?", "How do I remove a subscriber?"],
  },
  {
    match: (path) => path === "/system-monitor",
    title: "System Monitor",
    actions: ["Review alerts", "Filter audit logs", "Filter email events"],
    links: [
      { label: "Failed emails", href: "/system-monitor" },
      { label: "Audit logs", href: "/system-monitor" },
    ],
    prompts: ["Show me failed email events", "What should I check first?"],
  },
  {
    match: (path) => path === "/messages",
    title: "Messages",
    actions: ["Select conversation", "Send message", "Delete conversation"],
    prompts: ["How do conversations work?", "Why can I not send a message?"],
  },
  {
    match: (path) => path === "/settings",
    title: "Settings",
    actions: ["Change preferences", "Export data", "Deactivate account"],
    prompts: ["How do I export my data?", "How do I deactivate my account?"],
  },
];

function getPageAssistantGuide(pathname) {
  return pageAssistantGuides.find((guide) => guide.match(pathname)) ?? null;
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const parts = String(message.content).split(/(\s\/[a-z0-9][^\s,)]*)/gi);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6 ${
          isUser
            ? "site-button"
            : "site-border site-panel border text-[var(--site-fg)]"
        }`}
      >
        {parts.map((part, index) => {
          const trimmed = part.trim();

          if (!isUser && trimmed.startsWith("/")) {
            return (
              <Link
                key={`${part}-${index}`}
                href={trimmed}
                className="site-accent font-semibold underline-offset-4 hover:underline"
              >
                {part}
              </Link>
            );
          }

          return part;
        })}
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
  const pageGuide = getPageAssistantGuide(pathname);

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
              pageTitle: pageGuide?.title ?? "",
              visibleActions: pageGuide?.actions ?? [],
              visibleLinks: pageGuide?.links ?? [],
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
            {pageGuide ? (
              <div className="site-border site-panel rounded-lg border p-3">
                <p className="text-xs font-semibold">{pageGuide.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pageGuide.actions.slice(0, 5).map((action) => (
                    <span
                      key={action}
                      className="site-badge rounded px-2 py-1 text-[11px] font-semibold"
                    >
                      {action}
                    </span>
                  ))}
                </div>
                {pageGuide.links?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pageGuide.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="site-border site-field rounded px-2 py-1 text-[11px] font-semibold"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {messages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} message={message} />
            ))}
            {isSending ? (
              <div className="flex justify-start">
                <div className="site-border site-panel flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                  <LoadingCircle className="h-3.5 w-3.5" label="Thinking" />
                  Thinking
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
            {pageGuide?.prompts?.length ? (
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {pageGuide.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="site-border site-field shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
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
                className="site-button inline-flex min-h-10 min-w-16 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-70"
              >
                {isSending ? (
                  <LoadingCircle className="h-3.5 w-3.5" label="Sending" />
                ) : null}
                {isSending ? "Sending" : "Send"}
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
