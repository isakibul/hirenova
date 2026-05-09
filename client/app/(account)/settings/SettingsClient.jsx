"use client";

import Icon from "@components/Icon";
import SelectField from "@components/forms/SelectField";
import { useTheme } from "@components/theme/ThemeProvider";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

const storageKey = "hirenova-settings";

const defaultSettings = {
    theme: "light",
    defaultLocation: "",
    preferredJobType: "any",
    salaryVisibility: "show",
    profileVisibility: "visible",
    newJobs: true,
    applicationUpdates: true,
    employerMessages: true,
    securityEmails: true,
    weeklyDigest: false,
};

const jobTypeOptions = [
    { value: "any", label: "Any job type" },
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "remote", label: "Remote" },
    { value: "contract", label: "Contract" },
];

const salaryOptions = [
    { value: "show", label: "Show salary ranges" },
    { value: "compact", label: "Compact salary labels" },
    { value: "hide", label: "Hide salary prompts" },
];

const visibilityOptions = [
    { value: "visible", label: "Visible to employers" },
    { value: "limited", label: "Limited visibility" },
    { value: "hidden", label: "Hidden from employer search" },
];

function Toggle({ checked, onChange, label, description }) {
    return (<button type="button" onClick={() => onChange(!checked)} className="site-border flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="site-muted mt-1 block text-xs leading-5">{description}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[var(--site-button-bg)]" : "bg-[var(--site-border)]"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`}/>
      </span>
    </button>);
}

function Section({ title, children }) {
    return (<section className="site-border site-card rounded-lg border">
      <div className="border-b border-[var(--site-border)] px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>);
}

function getMessage(body, fallback) {
    return body?.error ?? body?.message ?? fallback;
}

function escapePdfText(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[\r\n]+/g, " ");
}

function wrapLine(line, maxLength = 82) {
    const words = String(line).split(" ");
    const lines = [];
    let current = "";

    words.forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxLength && current) {
            lines.push(current);
            current = word;
            return;
        }
        current = next;
    });

    if (current) {
        lines.push(current);
    }

    return lines;
}

function createPdf(lines) {
    const contentLines = [
        "BT",
        "/F1 11 Tf",
        "50 780 Td",
        "14 TL",
        ...lines.flatMap((line, index) => [
            index === 0 ? "" : "T*",
            `(${escapePdfText(line)}) Tj`,
        ]).filter(Boolean),
        "ET",
    ];
    const content = contentLines.join("\n");
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((object, index) => {
        offsets.push(pdf.length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export default function SettingsClient({ user }) {
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState({ ...defaultSettings, theme });
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [deactivatePassword, setDeactivatePassword] = useState("");
    const [deactivateConfirm, setDeactivateConfirm] = useState("");
    const [isDeactivating, setIsDeactivating] = useState(false);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            try {
                const stored = window.localStorage.getItem(storageKey);
                if (stored) {
                    setSettings((current) => ({ ...current, ...JSON.parse(stored), theme }));
                }
            }
            catch {
                setSettings((current) => ({ ...current, theme }));
            }
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [theme]);

    const roleLabel = useMemo(() => user.role === "employer"
        ? "Employer workspace"
        : user.role === "admin"
            ? "Admin workspace"
            : "Jobseeker workspace", [user.role]);

    function updateSetting(key, value) {
        setSettings((current) => ({ ...current, [key]: value }));
        setNotice("");
        setError("");
        if (key === "theme") {
            setTheme(value);
        }
    }

    function saveSettings() {
        window.localStorage.setItem(storageKey, JSON.stringify(settings));
        setNotice("Settings saved on this device.");
        setError("");
    }

    function resetSettings() {
        setSettings({ ...defaultSettings, theme });
        window.localStorage.removeItem(storageKey);
        setNotice("Settings reset.");
        setError("");
    }

    async function downloadAccountData() {
        setIsDownloading(true);
        setNotice("");
        setError("");
        try {
            const response = await fetch("/api/profile");
            const body = await response.json();
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body, "Unable to load account data."));
            }
            const profile = body.data;
            const lines = [
                "HireNova Account Data",
                `Generated: ${new Date().toLocaleString()}`,
                "",
                "Account",
                `Name: ${profile.username ?? user.name ?? "Not set"}`,
                `Email: ${profile.email ?? user.email ?? "Not set"}`,
                `Role: ${profile.role ?? user.role ?? "Not set"}`,
                `Status: ${profile.status ?? "Not set"}`,
                `Joined: ${profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "Not set"}`,
                "",
                "Profile",
                `Skills: ${profile.skills?.join(", ") || "Not set"}`,
                `Resume URL: ${profile.resumeUrl || "Not set"}`,
                `Experience: ${typeof profile.experience === "number" ? `${profile.experience} years` : "Not set"}`,
                `Preferred location: ${profile.preferredLocation || "Not set"}`,
                `Company name: ${profile.companyName || "Not set"}`,
                `Company website: ${profile.companyWebsite || "Not set"}`,
                `Company size: ${profile.companySize || "Not set"}`,
                "",
                "Local Preferences",
                ...Object.entries(settings).map(([key, value]) => `${key}: ${String(value)}`),
            ].flatMap((line) => wrapLine(line));
            const pdf = createPdf(lines.slice(0, 52));
            downloadBlob(pdf, `hirenova-account-data-${new Date().toISOString().slice(0, 10)}.pdf`);
            setNotice("Account data PDF downloaded.");
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to download account data.");
        }
        finally {
            setIsDownloading(false);
        }
    }

    function closeDeactivateModal() {
        if (isDeactivating) {
            return;
        }
        setIsDeactivateOpen(false);
        setDeactivatePassword("");
        setDeactivateConfirm("");
        setError("");
    }

    async function deactivateAccount(event) {
        event.preventDefault();
        setNotice("");
        setError("");
        if (deactivateConfirm.trim().toUpperCase() !== "DEACTIVATE") {
            setError("Type DEACTIVATE to confirm account deactivation.");
            return;
        }
        setIsDeactivating(true);
        try {
            const response = await fetch("/api/account/deactivate", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: deactivatePassword }),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(getMessage(body, "Unable to deactivate account."));
            }
            await signOut({ callbackUrl: "/login" });
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to deactivate account.");
            setIsDeactivating(false);
        }
    }

    return (<section className="px-5 py-12 md:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <div>
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Preferences</h1>
            <p className="site-muted mt-2 text-sm leading-6">
              Signed in as {user.email ?? user.name}. {roleLabel}
            </p>
          </div>
        </div>

        {notice ? <div className="site-success mt-5 rounded-lg border px-4 py-3 text-sm">{notice}</div> : null}
        {error ? <div className="site-danger mt-5 rounded-lg border px-4 py-3 text-sm">{error}</div> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Section title="Account Preferences">
              <div>
                <p className="text-sm font-semibold">Theme</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {["light", "dark"].map((option) => (<button key={option} type="button" onClick={() => updateSetting("theme", option)} className={`site-border rounded-md border px-3 py-2 text-sm font-semibold capitalize ${settings.theme === option ? "site-badge" : "site-field"}`}>
                      {option}
                    </button>))}
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Default job location</span>
                <input value={settings.defaultLocation} onChange={(event) => updateSetting("defaultLocation", event.target.value)} className="site-field mt-2 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="Remote, Dhaka, New York"/>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Preferred job type</span>
                  <SelectField value={settings.preferredJobType} onChange={(value) => updateSetting("preferredJobType", value)} options={jobTypeOptions} className="site-field mt-2 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"/>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Salary display</span>
                  <SelectField value={settings.salaryVisibility} onChange={(value) => updateSetting("salaryVisibility", value)} options={salaryOptions} className="site-field mt-2 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"/>
                </label>
              </div>
            </Section>

            <Section title="Notifications">
              <Toggle checked={settings.newJobs} onChange={(value) => updateSetting("newJobs", value)} label="New matching jobs" description="Get notified when new roles match your preferences."/>
              <Toggle checked={settings.applicationUpdates} onChange={(value) => updateSetting("applicationUpdates", value)} label="Application updates" description="Track status changes from employers."/>
              <Toggle checked={settings.employerMessages} onChange={(value) => updateSetting("employerMessages", value)} label="Employer messages" description="Receive alerts when employers contact you."/>
              <Toggle checked={settings.securityEmails} onChange={(value) => updateSetting("securityEmails", value)} label="Security emails" description="Keep important login and account protection emails enabled."/>
              <Toggle checked={settings.weeklyDigest} onChange={(value) => updateSetting("weeklyDigest", value)} label="Weekly digest" description="A weekly summary of jobs, saves, and applications."/>
            </Section>
            <button type="button" onClick={saveSettings} className="site-button inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold">
              <Icon name="check"/>
              Save Settings
            </button>
          </div>

          <aside className="space-y-6">
            <Section title="Privacy & Security">
              <label className="block">
                <span className="text-sm font-semibold">Profile visibility</span>
                <SelectField value={settings.profileVisibility} onChange={(value) => updateSetting("profileVisibility", value)} options={visibilityOptions} className="site-field mt-2 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"/>
              </label>
              <button type="button" onClick={downloadAccountData} disabled={isDownloading} className="site-border site-field w-full rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-70">
                {isDownloading ? "Preparing PDF..." : "Download account data"}
              </button>
              <button type="button" onClick={() => {
            setIsDeactivateOpen(true);
            setNotice("");
            setError("");
        }} className="w-full rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--site-danger-text)]">
                Deactivate account
              </button>
            </Section>
            <Section title="Active Session">
              <p className="site-muted text-sm leading-6">
                Current browser session for {user.email ?? "this account"}.
              </p>
              <button type="button" onClick={resetSettings} className="site-border site-field w-full rounded-md border px-4 py-2 text-sm font-semibold">
                Reset local preferences
              </button>
            </Section>
          </aside>
        </div>
      </div>
      {isDeactivateOpen ? (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="deactivate-title">
          <form onSubmit={deactivateAccount} className="site-border site-card w-full max-w-md rounded-lg border">
            <div className="border-b border-[var(--site-border)] p-5">
              <h2 id="deactivate-title" className="text-lg font-semibold">Deactivate account?</h2>
              <p className="site-muted mt-2 text-sm leading-6">
                This will suspend your account and sign you out. You will need an administrator to restore access.
              </p>
            </div>
            <div className="space-y-4 p-5">
              <label className="block">
                <span className="text-sm font-medium">Current password</span>
                <input type="password" value={deactivatePassword} onChange={(event) => setDeactivatePassword(event.target.value)} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" autoComplete="current-password" required/>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Type DEACTIVATE</span>
                <input value={deactivateConfirm} onChange={(event) => setDeactivateConfirm(event.target.value)} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" required/>
              </label>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[var(--site-border)] p-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeDeactivateModal} disabled={isDeactivating} className="site-border site-field rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={isDeactivating} className="rounded-md border border-[var(--site-danger-border)] bg-[var(--site-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--site-danger-text)] disabled:opacity-60">
                {isDeactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </form>
        </div>) : null}
    </section>);
}
