import Icon from "@/app/components/Icon";

const jobs = [
  {
    role: "Frontend Developer",
    company: "NovaTech Labs",
    match: "96% match",
    location: "Remote",
    type: "Full-time",
    salary: "$90k - $120k",
  },
  {
    role: "AI Product Analyst",
    company: "CareerGrid",
    match: "91% match",
    location: "Hybrid",
    type: "Contract",
    salary: "$70k - $95k",
  },
  {
    role: "Full Stack Engineer",
    company: "SkillBridge",
    match: "88% match",
    location: "On-site",
    type: "Full-time",
    salary: "$105k - $135k",
  },
];

export default function JobsPage() {
  return (
    <section className="px-5 md:px-[10vw] py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Jobs
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">
          Explore roles matched to your next move
        </h1>
        <p className="site-muted mx-auto mt-4 max-w-xl text-sm leading-6">
          Browse sample opportunities with match signals that make it easier to
          compare what deserves your attention.
        </p>
      </div>

      <div className="site-border site-card mx-auto mt-8 max-w-3xl rounded-xl border p-3">
        <div className="site-panel site-border mb-3 grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_140px_120px]">
          <label className="relative">
            <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Icon name="search" />
            </span>
            <input
              className="site-field w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none"
              placeholder="Search role or company"
            />
          </label>
          <select className="site-field rounded-md border px-3 py-2 text-sm focus:outline-none">
            <option>Any location</option>
            <option>Remote</option>
            <option>Hybrid</option>
          </select>
          <button className="site-button rounded-md px-3 py-2 text-sm font-medium">
            Search
          </button>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <article
              key={`${job.role}-${job.company}`}
              className="site-border site-panel flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex gap-3">
                <span className="site-badge mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                  <Icon name="briefcase" />
                </span>
                <div>
                  <h2 className="text-base font-semibold">{job.role}</h2>
                  <p className="site-muted mt-1 text-xs">
                    {job.company} · {job.location} · {job.type} · {job.salary}
                  </p>
                </div>
              </div>
              <div className="site-badge rounded-md px-3 py-1.5 text-xs font-semibold">
                {job.match}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
