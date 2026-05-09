import Icon from "@components/Icon";
const features = [
    {
        icon: "target",
        title: "AI Job Matching",
        desc: "Get personalized job recommendations based on your skills, interests, and career goals.",
    },
    {
        icon: "file",
        title: "Smart Resume Analysis",
        desc: "Understand resume gaps, improve your profile, and highlight the experience employers care about.",
    },
    {
        icon: "bell",
        title: "Real-time Alerts",
        desc: "Stay ahead with instant updates when strong opportunities match your profile.",
    },
    {
        icon: "chart",
        title: "Career Fit Score",
        desc: "Compare jobs by fit, growth potential, and skill alignment before you apply.",
    },
    {
        icon: "spark",
        title: "Skill Insights",
        desc: "See which skills can unlock better roles and where to focus your next learning step.",
    },
    {
        icon: "briefcase",
        title: "Application Tracking",
        desc: "Keep your search organized with a simple view of roles, progress, and next actions.",
    },
];
export default function FeaturesPage() {
    return (<section className="px-5 md:px-[10vw] py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="site-accent text-xs font-semibold uppercase tracking-widest">
          Features
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">
          Everything you need to find smarter opportunities
        </h1>
        <p className="site-muted mx-auto mt-4 max-w-xl text-sm leading-6">
          HireNova combines AI matching, resume intelligence, and timely alerts
          to help every candidate move with more confidence.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {features.map((feature) => (<article key={feature.title} className="site-border site-card rounded-lg border p-4">
            <div className="site-badge mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md">
              <Icon name={feature.icon}/>
            </div>
            <h2 className="text-base font-semibold">{feature.title}</h2>
            <p className="site-muted mt-2 text-xs leading-5">
              {feature.desc}
            </p>
          </article>))}
      </div>
    </section>);
}
