import Icon from "@components/Icon";
import Link from "next/link";

const featureGroups = [
  {
    eyebrow: "For jobseekers",
    title: "Keep your job search organized",
    desc: "Browse open roles, save jobs for later, apply with a cover letter, and track every application from one account.",
    features: [
      {
        icon: "search",
        title: "Browse jobs",
        desc: "Explore available roles with job details such as type, location, salary, experience, and required skills.",
      },
      {
        icon: "bell",
        title: "Save jobs",
        desc: "Bookmark roles you want to revisit before applying.",
      },
      {
        icon: "file",
        title: "Track applications",
        desc: "See submitted applications, application dates, cover letters, and current status in one place.",
      },
    ],
  },
  {
    eyebrow: "For employers",
    title: "Manage jobs and applicants clearly",
    desc: "Create job posts, manage your listings, review applicants, and update candidate status as hiring moves forward.",
    features: [
      {
        icon: "briefcase",
        title: "Job management",
        desc: "Post roles, edit job details, close listings, and keep your hiring workspace up to date.",
      },
      {
        icon: "user",
        title: "Applicant review",
        desc: "View candidates who applied to your jobs with their profile details and submitted cover letters.",
      },
      {
        icon: "check",
        title: "Status updates",
        desc: "Move applications through submitted, reviewing, shortlisted, rejected, and hired states.",
      },
    ],
  },
];

const workflow = [
  {
    icon: "user",
    title: "Create an account",
    desc: "Sign up as a jobseeker or employer and complete the profile details needed for your role.",
  },
  {
    icon: "briefcase",
    title: "Use your workspace",
    desc: "Jobseekers can browse, save, and apply. Employers can post jobs and review applicants.",
  },
  {
    icon: "bell",
    title: "Follow updates",
    desc: "Notifications and status changes help users keep track of important hiring activity.",
  },
];

export default function FeaturesPage() {
  return (
    <main>
      <section className="site-section py-10 lg:py-16">
        <div className="site-container">
          <div className="mx-auto max-w-5xl text-center">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Features
            </p>
            <h1 className="marketing-title mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Essential tools for Managing Jobs, Applications, and Candidates
            </h1>
            <p className="site-muted mx-auto mt-5 max-w-2xl text-base leading-7">
              HireNova gives jobseekers and employers a simple workspace for the
              core hiring flow by posting jobs, finding roles, applying, saving
              opportunities, reviewing applicants, and tracking status.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/jobs"
                className="site-button rounded-md px-4 py-2 text-sm font-medium transition"
              >
                Explore Jobs
              </Link>
              <Link
                href="/signup"
                className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section py-8">
        <div className="site-container grid items-stretch gap-5 lg:grid-cols-2">
          {featureGroups.map((group) => (
            <section
              key={group.eyebrow}
              className="site-border site-card h-full rounded-xl border p-5"
            >
              <p className="site-accent text-xs font-semibold uppercase tracking-widest">
                {group.eyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{group.title}</h2>
              <p className="site-muted mt-2 text-sm leading-6">{group.desc}</p>

              <div className="mt-5 space-y-3">
                {group.features.map((feature) => (
                  <article
                    key={feature.title}
                    className="site-border site-panel rounded-lg border p-4"
                  >
                    <div className="flex gap-3">
                      <span className="site-badge inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                        <Icon name={feature.icon} />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">
                          {feature.title}
                        </h3>
                        <p className="site-muted mt-1 min-h-10 text-xs leading-5">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="site-section py-10">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              A straightforward hiring path
            </h2>
          </div>

          <div className="mt-6 grid items-stretch gap-4 md:grid-cols-3">
            {workflow.map((item, index) => (
              <article
                key={item.title}
                className="site-border site-card h-full rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="site-badge inline-flex h-9 w-9 items-center justify-center rounded-md">
                    <Icon name={item.icon} />
                  </span>
                  <span className="site-muted text-xs font-semibold">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="site-muted mt-2 text-xs leading-5">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
