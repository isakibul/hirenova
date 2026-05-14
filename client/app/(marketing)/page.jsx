"use client";

import Icon from "@components/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const pipeline = [
  ["Applied", "142", "18% this week"],
  ["Screening", "38", "12 ready"],
  ["Interview", "16", "7 today"],
  ["Offer", "5", "3 closing"],
];

const candidateMatches = [
  ["Ayesha Rahman", "Senior Product Designer", "94", "Remote"],
  ["Nabil Karim", "Frontend Engineer", "91", "Dhaka"],
  ["Mira Chowdhury", "Customer Success Lead", "87", "Hybrid"],
];

const companySignals = [
  ["Northstar Labs", "8 roles", "42 applicants"],
  ["Atlas Health", "5 roles", "19 applicants"],
  ["BrightPath", "12 roles", "76 applicants"],
];

const activityFeed = [
  ["Offer accepted", "Senior Backend Engineer", "2m ago"],
  ["Interview scheduled", "Product Designer", "18m ago"],
  ["Job approved", "Growth Marketing Lead", "34m ago"],
];

const features = [
  {
    icon: "search",
    title: "Candidate-ready job discovery",
    desc: "Search by role, skill, salary, location, experience, and job type with clean result pages.",
  },
  {
    icon: "file",
    title: "Application intelligence",
    desc: "Every saved job, submitted application, status change, and message stays connected.",
  },
  {
    icon: "chart",
    title: "Admin-grade operations",
    desc: "Approvals, users, newsletter activity, audit logs, email events, and platform health in one place.",
  },
];

function handleEmailPath(email) {
  const trimmed = email.trim();

  return trimmed ? `/signup?email=${encodeURIComponent(trimmed)}` : "/signup";
}

function BrandGlyph() {
  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-[#111827] shadow-[0_18px_35px_rgb(17_24_39/0.2)]">
      <div className="absolute inset-x-2 top-2 h-2 rounded-full bg-[#38bdf8]" />
      <div className="absolute left-2 top-6 h-6 w-2 rounded-full bg-[#22c55e]" />
      <div className="absolute left-6 top-5 h-7 w-2 rounded-full bg-white" />
      <div className="absolute right-2 top-3 h-9 w-2 rounded-full bg-[#f59e0b]" />
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleJoin(event) {
    event.preventDefault();
    router.push(handleEmailPath(email));
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--site-border)] px-5 py-10 md:px-[8vw] lg:py-14">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc_0%,var(--site-bg)_44%,#ecfdf5_100%)] dark:bg-[linear-gradient(135deg,#111827_0%,#172033_48%,#052e16_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_560px] lg:items-center">
          <div>
            <div className="flex items-center gap-4">
              <BrandGlyph />
              <div>
                <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                  HireNova recruiting workspace
                </p>
                <p className="site-muted mt-1 text-sm">
                  Demo data from a modern hiring week
                </p>
              </div>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              A sharper command center for teams that hire with momentum
            </h1>
            <p className="site-muted mt-5 max-w-2xl text-base leading-7">
              HireNova brings job discovery, candidate review, application
              tracking, messaging, approvals, and operations monitoring into a
              focused workspace built for real recruiting flow.
            </p>

            <form
              onSubmit={handleJoin}
              className="site-border site-card mt-7 grid max-w-2xl gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_auto]"
            >
              <label className="sr-only" htmlFor="home-email">
                Email address
              </label>
              <input
                id="home-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Work email or candidate email"
                type="email"
                className="site-field h-11 rounded-md border px-3 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="site-button inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition"
              >
                Start workspace
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/jobs"
                className="site-border site-field inline-flex items-center gap-2 rounded-md border px-3 py-2 font-semibold transition hover:border-[var(--site-accent)]"
              >
                <Icon name="search" />
                Browse live roles
              </Link>
              <Link
                href="/features"
                className="site-link inline-flex items-center gap-2 px-1 py-2 font-semibold transition hover:text-[var(--site-accent)]"
              >
                View platform tour
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["314", "active candidates"],
                ["28", "open roles"],
                ["99.8%", "API uptime"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-l-2 border-[var(--site-accent)] pl-3"
                >
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="site-muted mt-1 text-xs leading-5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="site-border site-card site-elevated overflow-hidden rounded-lg border">
            <div className="bg-[#111827] p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Executive hiring view</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Pipeline, matching, and operational health
                  </p>
                </div>
                <span className="rounded-md border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                  Healthy
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {pipeline.map(([label, value, note]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/10 bg-white/8 p-3"
                  >
                    <p className="text-xs text-slate-300">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest">
                    Candidate matches
                  </p>
                  <Icon name="spark" />
                </div>
                <div className="mt-3 divide-y divide-[var(--site-border)] rounded-lg border border-[var(--site-border)]">
                  {candidateMatches.map(([name, role, score, location]) => (
                    <div
                      key={name}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        <p className="site-muted mt-1 truncate text-xs">
                          {role} · {location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{score}%</p>
                        <p className="site-muted text-[11px]">match</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {companySignals.map(([company, rolesOpen, applicants]) => (
                    <div
                      key={company}
                      className="site-border site-panel rounded-lg border p-3"
                    >
                      <p className="truncate text-xs font-semibold">
                        {company}
                      </p>
                      <p className="site-muted mt-2 text-[11px]">
                        {rolesOpen} · {applicants}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="site-panel border-t border-[var(--site-border)] p-4 lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Live activity
                </p>
                <div className="mt-4 space-y-3">
                  {activityFeed.map(([event, role, time]) => (
                    <div key={`${event}-${role}`} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                        <p className="font-semibold">{event}</p>
                      </div>
                      <p className="site-muted mt-1 text-xs">{role}</p>
                      <p className="site-muted mt-0.5 text-[11px]">{time}</p>
                    </div>
                  ))}
                </div>

                <div className="site-success mt-5 rounded-md border px-3 py-2 text-xs font-semibold">
                  0 failed emails today
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-[8vw]">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Why it feels different
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Built around actual hiring moments, not generic admin screens
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="site-border site-card rounded-lg border p-5"
              >
                <div className="site-badge mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md">
                  <Icon name={feature.icon} />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="site-muted mt-2 text-sm leading-6">
                  {feature.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 md:px-[8vw]">
        <div className="site-border mx-auto grid max-w-7xl gap-6 rounded-lg border bg-[var(--site-card)] p-5 md:grid-cols-[0.9fr_1.1fr] md:p-7">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Demo workspace
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Enough real-world texture to evaluate the product quickly
            </h2>
            <p className="site-muted mt-3 text-sm leading-6">
              Sample companies, candidates, activity, health states, and role
              signals make the app feel populated before production data lands.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Candidate names, locations, roles, and match scores",
              "Employer hiring load and applicant volume",
              "Recent hiring activity and email health signals",
              "Role-based workflows for candidates, employers, and admins",
            ].map((item) => (
              <div key={item} className="flex gap-3 text-sm leading-6">
                <span className="site-success mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border">
                  <Icon name="check" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
