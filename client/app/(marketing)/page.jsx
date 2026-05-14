"use client";

import Icon from "@components/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const features = [
  {
    icon: "search",
    title: "Find Jobs",
    desc: "Browse roles by title, location, job type, salary, experience, and skills.",
  },
  {
    icon: "file",
    title: "Track Applications",
    desc: "Apply to jobs, save interesting roles, and follow your application status.",
  },
  {
    icon: "briefcase",
    title: "Manage Hiring",
    desc: "Post jobs, review applicants, and keep hiring activity organized.",
  },
];

function getSignupPath(email) {
  const trimmed = email.trim();

  return trimmed ? `/signup?email=${encodeURIComponent(trimmed)}` : "/signup";
}

export default function Home() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();
    router.push(getSignupPath(email));
  }

  return (
    <>
      <section className="px-5 py-14 md:px-[10vw] lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="site-accent text-xs font-semibold uppercase tracking-widest">
            HireNova
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            A simple workspace for jobs and hiring
          </h1>
          <p className="site-muted mx-auto mt-5 max-w-2xl text-base leading-7">
            HireNova helps jobseekers find roles and track applications while
            employers manage jobs, candidates, and conversations in one place.
          </p>

          <form
            onSubmit={handleSubmit}
            className="site-border site-card mx-auto mt-8 grid max-w-xl gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_auto]"
          >
            <label className="sr-only" htmlFor="home-email">
              Email address
            </label>
            <input
              id="home-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              type="email"
              className="site-field h-11 rounded-md border px-3 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="site-button h-11 rounded-md px-4 text-sm font-semibold transition"
            >
              Get Started
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
            <Link
              href="/jobs"
              className="site-border site-field inline-flex items-center gap-2 rounded-md border px-3 py-2 font-semibold transition hover:border-[var(--site-accent)]"
            >
              <Icon name="search" />
              Browse Jobs
            </Link>
            <Link
              href="/features"
              className="site-link inline-flex items-center px-3 py-2 font-semibold transition hover:text-[var(--site-accent)]"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 md:px-[10vw]">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="site-border site-card rounded-lg border p-5"
            >
              <div className="site-badge mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md">
                <Icon name={feature.icon} />
              </div>
              <h2 className="text-base font-semibold">{feature.title}</h2>
              <p className="site-muted mt-2 text-sm leading-6">
                {feature.desc}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
