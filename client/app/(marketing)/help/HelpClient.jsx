"use client";

import Icon from "@components/Icon";
import Link from "next/link";
import { useMemo, useState } from "react";

const categories = [
    "All",
    "Account",
    "Jobs",
    "Applications",
    "Employers",
    "Security",
];

const faqs = [
    {
        category: "Account",
        question: "How do I verify my email?",
        answer: "Open the verification email and follow the link. HireNova verifies the token, signs you in, and sends you to the jobs page.",
    },
    {
        category: "Jobs",
        question: "How do I apply to a job?",
        answer: "Open a job details page, add an optional cover letter, and submit the application from the action panel.",
    },
    {
        category: "Jobs",
        question: "How do I save jobs?",
        answer: "Use the Save Job button on a job details page. Saved roles appear in your Saved Jobs page.",
    },
    {
        category: "Applications",
        question: "Where can I track applications?",
        answer: "Jobseekers can open Applications from the profile menu to see every submitted application and current status.",
    },
    {
        category: "Employers",
        question: "How do employers review applicants?",
        answer: "Employers open Manage Jobs, choose Applicants on a listing, and update each candidate status.",
    },
    {
        category: "Security",
        question: "Why is my account pending?",
        answer: "New accounts stay pending until email verification is completed. You can resend the verification email from signup.",
    },
];

const quickLinks = [
    { href: "/jobs", label: "Browse jobs", icon: "briefcase" },
    { href: "/applications", label: "Applications", icon: "file" },
    { href: "/saved-jobs", label: "Saved jobs", icon: "bell" },
    { href: "/profile", label: "Profile", icon: "user" },
    { href: "/dashboard", label: "Dashboard", icon: "chart" },
    { href: "/status", label: "System status", icon: "spark" },
];

function getMailto({ subject, category, message, email }) {
    const body = [
        `Category: ${category}`,
        email ? `Reply to: ${email}` : "",
        "",
        message,
    ].filter(Boolean).join("\n");

    return `mailto:support@hirenova.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function HelpClient({ health }) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [openQuestion, setOpenQuestion] = useState(faqs[0].question);
    const [form, setForm] = useState({
        subject: "",
        category: "Account",
        email: "",
        message: "",
    });
    const [notice, setNotice] = useState("");

    const filteredFaqs = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return faqs.filter((faq) => {
            const matchesCategory = category === "All" || faq.category === category;
            const matchesQuery = !normalizedQuery ||
                `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(normalizedQuery);
            return matchesCategory && matchesQuery;
        });
    }, [category, query]);

    function submitSupport(event) {
        event.preventDefault();
        setNotice("Support draft created in your email app.");
        window.location.href = getMailto(form);
    }

    return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">Help Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">How can we help?</h1>
            <div className="site-border site-card mt-6 rounded-lg border p-4">
              <label className="relative block">
                <span className="site-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Icon name="search"/>
                </span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="site-field h-11 w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none" placeholder="Search account, jobs, applications, security"/>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((item) => (<button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${category === item ? "site-badge" : "site-border site-field border"}`}>
                    {item}
                  </button>))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {filteredFaqs.length === 0 ? (<div className="site-border site-card rounded-lg border p-5">
                  <p className="font-semibold">No matching help articles</p>
                  <p className="site-muted mt-1 text-sm">Try another keyword or contact support.</p>
                </div>) : filteredFaqs.map((faq) => {
                const isOpen = openQuestion === faq.question;
                return (<div key={faq.question} className="site-border site-card rounded-lg border">
                    <button type="button" onClick={() => setOpenQuestion(isOpen ? "" : faq.question)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
                      <span>
                        <span className="block text-sm font-semibold">{faq.question}</span>
                        <span className="site-muted mt-1 block text-xs">{faq.category}</span>
                      </span>
                      <Icon name={isOpen ? "x" : "plus"}/>
                    </button>
                    {isOpen ? (<p className="site-muted border-t border-[var(--site-border)] px-4 py-3 text-sm leading-6">
                        {faq.answer}
                      </p>) : null}
                  </div>);
            })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className={`rounded-lg border p-4 ${health.ok ? "site-success" : "site-danger"}`}>
              <p className="text-sm font-semibold">System Status</p>
              <p className="mt-2 text-2xl font-semibold">{health.status}</p>
              <Link href="/status" className="mt-3 inline-flex text-sm font-semibold underline-offset-4 hover:underline">
                View status
              </Link>
            </div>

            <div className="site-border site-card rounded-lg border p-4">
              <h2 className="font-semibold">Quick Links</h2>
              <div className="mt-3 grid gap-2">
                {quickLinks.map((link) => (<Link key={link.href} href={link.href} className="site-border site-field inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold">
                    <Icon name={link.icon}/>
                    {link.label}
                  </Link>))}
              </div>
            </div>

            <form onSubmit={submitSupport} className="site-border site-card rounded-lg border p-4">
              <h2 className="font-semibold">Contact Support</h2>
              <div className="mt-4 space-y-3">
                <input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="Subject" required/>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none">
                  {categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
                </select>
                <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="Reply email"/>
                <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className="site-field min-h-32 w-full resize-y rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="What happened?" required/>
              </div>
              {notice ? <p className="site-success mt-3 rounded-md border px-3 py-2 text-xs">{notice}</p> : null}
              <button type="submit" className="site-button mt-4 w-full rounded-md px-4 py-2 text-sm font-semibold">
                Send Message
              </button>
            </form>
          </aside>
        </div>
      </div>
    </section>);
}
