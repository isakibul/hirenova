"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { requestJson } from "@lib/clientApi";
import Icon from "./Icon";
import LoadingCircle from "./LoadingCircle";

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "/features" },
      { label: "Browse Jobs", href: "/jobs" },
      { label: "About", href: "/about" },
      { label: "System Status", href: "/status" },
    ],
  },
  {
    title: "Jobseekers",
    links: [
      { label: "Find Jobs", href: "/jobs" },
      { label: "Saved Jobs", href: "/saved-jobs" },
      { label: "Applications", href: "/applications" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    title: "Employers",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Manage Jobs", href: "/manage-jobs" },
      { label: "Candidates", href: "/candidates" },
      { label: "Messages", href: "/messages" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Notifications", href: "/notifications" },
      { label: "Settings", href: "/settings" },
      { label: "Create Account", href: "/signup" },
    ],
  },
];

const contactItems = [
  { icon: "mail", label: "support@hirenova.com" },
  { icon: "check", label: "Hiring workflow updates" },
];

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const isMessagesPage = pathname === "/messages";

  if (isMessagesPage) {
    return null;
  }

  async function handleNewsletter(event) {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();

    setMessage("");
    setError("");

    if (!nextEmail) {
      setError("Enter your email to join the update list.");
      return;
    }

    setIsSubscribing(true);

    try {
      const body = await requestJson("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: nextEmail, source: "footer" }),
      }, "Unable to subscribe right now.");

      setMessage(body?.message ?? "Thanks for joining HireNova updates.");
      setEmail("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to subscribe right now.",
      );
    } finally {
      setIsSubscribing(false);
    }
  }

  return (
    <footer className="site-border site-section border-t py-10">
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
          <section className="max-w-md">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Hire<span className="site-accent">Nova</span>
            </Link>
            <p className="site-muted mt-3 text-sm leading-6">
              A focused hiring workspace for discovering jobs, managing
              applicants, tracking applications, and keeping conversations
              moving.
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="site-badge inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                    <Icon name={item.icon} />
                  </span>
                  <span className="site-soft">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="site-border site-card rounded-lg border p-4">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Newsletter
            </p>
            <h2 className="mt-2 text-base font-semibold">
              Get hiring updates from HireNova
            </h2>
            <p className="site-muted mt-2 text-sm leading-6">
              Receive product notes, workflow tips, and useful updates for
              jobseekers and hiring teams.
            </p>
            <form
              onSubmit={handleNewsletter}
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                required
                className="site-field min-h-10 flex-1 rounded-md border px-3 text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="site-button inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <LoadingCircle className="h-3.5 w-3.5" label="Subscribing" />
                ) : null}
                {isSubscribing ? "Joining" : "Subscribe"}
              </button>
            </form>
            {message ? (
              <p className="site-success mt-3 rounded-md border px-3 py-2 text-xs">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="site-danger mt-3 rounded-md border px-3 py-2 text-xs">
                {error}
              </p>
            ) : null}
          </section>
        </div>

        <div className="mt-8 grid gap-6 border-t border-(--site-border) pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="site-link text-sm transition hover:text-(--site-accent)"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="site-muted mt-8 flex flex-col gap-3 border-t border-(--site-border) pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} HireNova. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/about" className="transition hover:text-(--site-accent)">
              About
            </Link>
            <Link
              href="/features"
              className="transition hover:text-(--site-accent)"
            >
              Features
            </Link>
            <Link href="/status" className="transition hover:text-(--site-accent)">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
