"use client";

import Icon from "@components/Icon";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const router = useRouter();

  function handleJoin(event) {
    event.preventDefault();
    const query = email.trim()
      ? `?email=${encodeURIComponent(email.trim())}`
      : "";
    router.push(`/signup${query}`);
  }

  async function handleNewsletter(event) {
    event.preventDefault();
    const nextEmail = newsletterEmail.trim().toLowerCase();

    setNewsletterMessage("");
    setNewsletterError("");

    if (!nextEmail) {
      setNewsletterError("Enter your email to join the HireNova update list.");
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: nextEmail, source: "home" }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body?.error ?? body?.message ?? "Unable to subscribe right now.",
        );
      }

      setNewsletterMessage(
        body?.message ?? "Thanks for joining the HireNova update list.",
      );
      setNewsletterEmail("");
    } catch (caughtError) {
      setNewsletterError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to subscribe right now.",
      );
    } finally {
      setIsSubscribing(false);
    }
  }

  return (
    <>
      <section className="px-5 pb-12 pt-12 md:px-[10vw]">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Hiring platform
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
              A complete hiring workspace for jobs, applications, and conversations
            </h1>

            <p className="site-muted mt-4 max-w-xl text-sm leading-6">
              HireNova helps jobseekers browse and apply for roles while
              employers and admins manage job approvals, review candidates,
              track applications, and keep conversations in one place.
            </p>

            <form
              onSubmit={handleJoin}
              className="site-border site-card site-elevated mt-6 flex w-full max-w-md gap-2 rounded-lg border p-2"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                className="site-field flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="site-button rounded-md px-4 py-2 text-sm font-medium transition"
              >
                Join
              </button>
            </form>
          </div>

          <div className="site-border site-card site-elevated rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Application Workspace</p>
                <p className="site-muted mt-1 text-xs">
                  Simple status tracking
                </p>
              </div>
              <span className="site-badge rounded-md px-2.5 py-1 text-xs font-semibold">
                Active
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ["Frontend Developer", "Reviewing"],
                ["Product Designer", "Shortlisted"],
                ["Support Specialist", "Submitted"],
              ].map(([role, status]) => (
                <div
                  key={role}
                  className="site-border site-panel rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="site-accent">
                        <Icon name="briefcase" />
                      </span>
                      <p className="text-sm font-semibold">{role}</p>
                    </div>
                    <span className="site-accent text-xs font-semibold">
                      {status}
                    </span>
                  </div>
                  <div className="site-divider mt-3 h-px" />
                  <p className="site-muted mt-2 text-xs">
                    Track where each application stands after applying.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="grid gap-4 px-5 py-10 md:grid-cols-3 md:px-[10vw]"
      >
        {[
          {
            icon: "search",
            title: "Browse Jobs",
            desc: "Explore available roles and review details before applying.",
          },
          {
            icon: "bell",
            title: "Save Jobs",
            desc: "Keep interesting roles bookmarked in your account.",
          },
          {
            icon: "file",
            title: "Application Tracking",
            desc: "Follow submitted applications and status updates.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="site-border site-card rounded-lg border p-4"
          >
            <div className="site-badge mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md">
              <Icon name={feature.icon} />
            </div>
            <h2 className="mb-2 text-base font-semibold">{feature.title}</h2>
            <p className="site-muted text-xs leading-5">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section id="how" className="px-5 py-10 text-center md:px-[10vw]">
        <h2 className="mb-6 text-2xl font-semibold">How HireNova Works</h2>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {["Create Profile", "Browse or Post Jobs", "Track Applications"].map(
            (step, index) => (
              <div
                key={step}
                className="site-border site-card rounded-lg border p-4"
              >
                <div className="site-accent mb-2 text-lg font-semibold">
                  0{index + 1}
                </div>
                <h3 className="text-sm font-semibold">{step}</h3>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="site-border border-t px-5 py-12 md:px-[10vw]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="site-accent text-xs font-semibold uppercase tracking-widest">
            Newsletter
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Get hiring updates from HireNova
          </h2>
          <p className="site-soft mt-2 text-sm leading-6">
            Receive platform updates, hiring workflow tips, and product notes
            for jobseekers, employers, and admins.
          </p>

          <form
            onSubmit={handleNewsletter}
            className="site-border site-card mx-auto mt-5 flex w-full max-w-md gap-2 rounded-lg border p-2"
          >
            <input
              value={newsletterEmail}
              onChange={(event) => {
                setNewsletterEmail(event.target.value);
                setNewsletterMessage("");
                setNewsletterError("");
              }}
              placeholder="Email address"
              type="email"
              required
              className="site-field flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="site-button rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60"
            >
              {isSubscribing ? "Saving..." : "Subscribe"}
            </button>
          </form>
          {newsletterMessage ? (
            <p className="site-success mx-auto mt-3 max-w-md rounded-md border px-3 py-2 text-xs">
              {newsletterMessage}
            </p>
          ) : null}
          {newsletterError ? (
            <p className="site-danger mx-auto mt-3 max-w-md rounded-md border px-3 py-2 text-xs">
              {newsletterError}
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
