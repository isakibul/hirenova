import Icon from "@components/Icon";
import Link from "next/link";
import HomeSignupForm from "./HomeSignupForm";

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

export default function Home() {
  return (
    <>
      <section className="site-section py-10 lg:py-16">
        <div className="site-container">
          <div className="mx-auto max-w-5xl text-center">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              HireNova Talent OS
            </p>
            <h1 className="marketing-title mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              One command center for Jobs, Candidates, and Hiring Momentum
            </h1>
            <p className="site-muted mx-auto mt-5 max-w-2xl text-base leading-7">
              HireNova brings job search, application tracking, employer
              workflows, realtime conversations, and admin operations into one
              production-minded workspace.
            </p>

            <HomeSignupForm />

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
        </div>
      </section>

      <section className="site-section pb-14">
        <div className="site-container grid items-stretch gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="site-border site-card h-full rounded-lg border p-5"
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
