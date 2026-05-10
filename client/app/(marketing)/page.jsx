"use client";

import Icon from "@components/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleJoin(event) {
    event.preventDefault();
    const query = email.trim()
      ? `?email=${encodeURIComponent(email.trim())}`
      : "";
    router.push(`/signup${query}`);
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
              Manage jobs, applications, and candidates in one workspace
            </h1>

            <p className="site-muted mt-4 max-w-xl text-sm leading-6">
              HireNova helps jobseekers browse and apply for roles while
              employers post jobs, review applicants, and keep application
              status clear.
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

      <section className="site-border border-t px-5 py-12 text-center md:px-[10vw]">
        <h2 className="text-2xl font-semibold">
          Start managing your hiring journey today
        </h2>
        <p className="site-soft mt-2 text-sm">
          Create an account to browse jobs, post roles, or track applications.
        </p>

        <Link
          href="/signup"
          className="site-button mt-5 inline-block rounded-md px-4 py-2 text-sm font-medium transition"
        >
          Get Started
        </Link>
      </section>
    </>
  );
}
