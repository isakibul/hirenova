"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@components/Icon";
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
    return (<>
      {/* Hero */}
      <section className="px-5 md:px-[10vw] pb-12 pt-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              AI career matching platform
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
              Find better-fit roles with a smarter job search workspace
            </h2>

            <p className="site-muted mt-4 max-w-xl text-sm leading-6">
              HireNova analyzes your profile, ranks relevant opportunities, and
              keeps applications organized for a more focused search.
            </p>

            <form onSubmit={handleJoin} className="site-border site-card site-elevated mt-6 flex w-full max-w-md gap-2 rounded-lg border p-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" type="email" className="site-field flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"/>
              <button type="submit" className="site-button rounded-md px-4 py-2 text-sm font-medium transition">
                Join
              </button>
            </form>
          </div>

          <div className="site-border site-card site-elevated rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Recommended Matches</p>
                <p className="site-muted mt-1 text-xs">
                  Updated for your profile
                </p>
              </div>
              <span className="site-badge rounded-md px-2.5 py-1 text-xs font-semibold">
                Live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {[
            ["Product Designer", "94% match"],
            ["Frontend Engineer", "91% match"],
            ["Talent Analyst", "87% match"],
        ].map(([role, match]) => (<div key={role} className="site-border site-panel rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="site-accent">
                        <Icon name="briefcase"/>
                      </span>
                      <p className="text-sm font-semibold">{role}</p>
                    </div>
                    <span className="site-accent text-xs font-semibold">
                      {match}
                    </span>
                  </div>
                  <div className="site-divider mt-3 h-px"/>
                  <p className="site-muted mt-2 text-xs">
                    Skills, salary band, and location preferences aligned.
                  </p>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="grid gap-4 px-5 md:px-[10vw] py-10 md:grid-cols-3">
        {[
            {
                icon: "target",
                title: "AI Job Matching",
                desc: "Get jobs recommended based on your skills and experience.",
            },
            {
                icon: "file",
                title: "Smart Resume Analysis",
                desc: "Upload your resume and let AI optimize your profile.",
            },
            {
                icon: "bell",
                title: "Real-time Alerts",
                desc: "Never miss a job opportunity with instant notifications.",
            },
        ].map((f, i) => (<div key={i} className="site-border site-card rounded-lg border p-4">
            <div className="site-badge mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md">
              <Icon name={f.icon}/>
            </div>
            <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
            <p className="site-muted text-xs leading-5">{f.desc}</p>
          </div>))}
      </section>

      {/* How it works */}
      <section id="how" className="px-5 md:px-[10vw] py-10 text-center">
        <h2 className="mb-6 text-2xl font-semibold">How HireNova Works</h2>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          {["Create Profile", "AI Analysis", "Get Hired"].map((step, i) => (<div key={i} className="site-border site-card rounded-lg border p-4">
              <div className="site-accent mb-2 text-lg font-semibold">
                0{i + 1}
              </div>
              <h3 className="text-sm font-semibold">{step}</h3>
            </div>))}
        </div>
      </section>

      {/* CTA */}
      <section className="site-border border-t px-5 md:px-[10vw] py-12 text-center">
        <h2 className="text-2xl font-semibold">
          Start your AI career journey today
        </h2>
        <p className="site-soft mt-2 text-sm">
          Join thousands of candidates using HireNova
        </p>

        <Link href="/signup" className="site-button mt-5 inline-block rounded-md px-4 py-2 text-sm font-medium transition">
          Get Started Free
        </Link>
      </section>
    </>);
}
