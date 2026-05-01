import Icon from "@/app/components/Icon";

const steps = [
  {
    icon: "user",
    step: "01",
    title: "Create Profile",
    desc: "Add your background, skills, target roles, and work preferences in a few focused steps.",
  },
  {
    icon: "spark",
    step: "02",
    title: "AI Analysis",
    desc: "HireNova reviews your profile and identifies roles that fit your strengths and career direction.",
  },
  {
    icon: "check",
    step: "03",
    title: "Get Hired",
    desc: "Review matched jobs, improve your resume, and apply with a clearer view of what fits.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <section className="px-5 md:px-[10vw] py-12 text-center">
      <div className="mx-auto max-w-3xl">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          How it Works
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">
          From profile to opportunity in three simple steps
        </h1>
        <p className="site-muted mx-auto mt-4 max-w-xl text-sm leading-6">
          The experience stays simple while the matching engine does the heavy
          lifting behind the scenes.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <article
            key={item.step}
            className="site-border site-card rounded-lg border p-4"
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="site-badge inline-flex h-8 w-8 items-center justify-center rounded-md">
                <Icon name={item.icon} />
              </span>
            </div>
            <h2 className="text-sm font-semibold">{item.title}</h2>
            <p className="site-muted mt-2 text-xs leading-5">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
