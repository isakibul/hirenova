export const settingsStorageKey = "hirenova-settings";

export const defaultSettings = {
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

export const jobTypeOptions = [
    { value: "any", label: "Any job type" },
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "remote", label: "Remote" },
    { value: "contract", label: "Contract" },
];

export const salaryOptions = [
    { value: "show", label: "Show salary ranges" },
    { value: "compact", label: "Compact salary labels" },
    { value: "hide", label: "Hide salary prompts" },
];

export const visibilityOptions = [
    { value: "visible", label: "Visible to employers" },
    { value: "limited", label: "Limited visibility" },
    { value: "hidden", label: "Hidden from employer search" },
];

export const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Night" },
];

export function escapePdfText(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[\r\n]+/g, " ");
}

export function wrapLine(line, maxLength = 82) {
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

export function buildAccountDataLines({ profile = {}, settings = {}, user = {}, generatedAt = new Date() }) {
    return [
        "HireNova Account Data",
        `Generated: ${generatedAt.toLocaleString()}`,
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
        `About company: ${profile.companyAbout || "Not set"}`,
        "",
        "Preferences",
        ...Object.entries(settings).map(([key, value]) => `${key}: ${String(value)}`),
    ].flatMap((line) => wrapLine(line));
}

export function createPdf(lines) {
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
