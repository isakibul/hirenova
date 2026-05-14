import Icon from "@components/Icon";
import Link from "next/link";

const values = [
  {
    icon: "briefcase",
    title: "Clear job management",
    desc: "Employers can keep posted roles, applicants, and status updates in one place.",
  },
  {
    icon: "file",
    title: "Organized applications",
    desc: "Jobseekers can review their submitted applications and follow each role's current status.",
  },
  {
    icon: "bell",
    title: "Useful updates",
    desc: "Notifications help users notice new applications and application status changes.",
  },
];

const audiences = [
  {
    icon: "user",
    title: "Jobseekers",
    desc: "Create a profile, browse jobs, save roles, apply, and track applications.",
  },
  {
    icon: "briefcase",
    title: "Employers",
    desc: "Post jobs, manage listings, review applicants, and update application statuses.",
  },
  {
    icon: "search",
    title: "Hiring teams",
    desc: "Review candidate information and keep application decisions easier to follow.",
  },
];

const platform = [
  "Job listings",
  "Candidate profiles",
  "Saved jobs",
  "Applications",
  "Notifications",
  "Account settings",
];

export default function AboutPage() {
  return (
    <main>
      <section className="site-section py-12">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              About HireNova
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
              A hiring platform for finding jobs, managing applications, and
              reviewing candidates
            </h1>
            <p className="site-muted mt-4 max-w-2xl text-sm leading-6">
              HireNova helps jobseekers keep their search organized and helps
              employers manage the hiring process from job posting to applicant
              review.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/features"
                className="site-button rounded-md px-4 py-2 text-sm font-medium transition"
              >
                View Features
              </Link>
              <Link
                href="/jobs"
                className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold transition"
              >
                Browse Jobs
              </Link>
            </div>
          </div>

          <aside className="site-border site-card site-elevated rounded-xl border p-5">
            <p className="text-sm font-semibold">What the platform includes</p>
            <div className="mt-4 grid gap-2">
              {platform.map((item) => (
                <div
                  key={item}
                  className="site-border site-panel flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="site-success inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border">
                    <Icon name="check" />
                  </span>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="site-section py-8">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Purpose
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Keep the hiring process easier to follow
            </h2>
            <p className="site-muted mt-3 text-sm leading-6">
              The platform focuses on the essentials users need every day:
              roles, profiles, saved jobs, applications, notifications, and
              status updates.
            </p>
          </div>

          <div className="mt-6 grid items-start gap-4 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="site-border site-card rounded-lg border p-4"
              >
                <span className="site-badge inline-flex h-9 w-9 items-center justify-center rounded-md">
                  <Icon name={value.icon} />
                </span>
                <h3 className="mt-4 text-base font-semibold">{value.title}</h3>
                <p className="site-muted mt-2 text-xs leading-5">
                  {value.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section py-10">
        <div className="site-container">
          <div className="site-border site-card rounded-xl border p-5 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
              <div>
                <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                  Who it serves
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Built for both sides of hiring
                </h2>
              </div>

              <div className="grid items-start gap-3 md:grid-cols-3">
                {audiences.map((audience) => (
                  <article
                    key={audience.title}
                    className="site-border site-panel rounded-lg border p-4"
                  >
                    <span className="site-badge inline-flex h-8 w-8 items-center justify-center rounded-md">
                      <Icon name={audience.icon} />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold">
                      {audience.title}
                    </h3>
                    <p className="site-muted mt-2 text-xs leading-5">
                      {audience.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
