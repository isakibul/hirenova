import Icon from "@components/Icon";
import Link from "next/link";

const values = [
  {
    icon: "briefcase",
    title: "Clear Job Management",
    desc: "Employers can keep posted roles, applicants, and status updates in one place.",
  },
  {
    icon: "file",
    title: "Organized Applications",
    desc: "Jobseekers can review their submitted applications and follow each role's current status.",
  },
  {
    icon: "bell",
    title: "Useful Updates",
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

export default function AboutPage() {
  return (
    <main>
      <section className="site-section py-10 lg:py-16">
        <div className="site-container">
          <div className="mx-auto max-w-5xl text-center">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              About HireNova
            </p>
            <h1 className="marketing-title mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Built for Jobs, Applications, and Candidates.
            </h1>
            <p className="site-muted mx-auto mt-5 max-w-2xl text-base leading-7">
              HireNova helps jobseekers keep their search organized and helps
              employers manage the hiring process from job posting to applicant
              review.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
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
        </div>
      </section>

      <section className="site-section py-8">
        <div className="site-container">
          <div className="grid items-stretch gap-4 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="site-border site-card h-full rounded-lg border p-4"
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

              <div className="grid items-stretch gap-3 md:grid-cols-3">
                {audiences.map((audience) => (
                  <article
                    key={audience.title}
                    className="site-border site-panel h-full rounded-lg border p-4"
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
