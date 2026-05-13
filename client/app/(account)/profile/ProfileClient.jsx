"use client";
import FieldError from "@components/forms/FieldError";
import Icon from "@components/Icon";
import StatusNotice from "@components/StatusNotice";
import { emailError, getVisibleErrors, hasValidationErrors, passwordError, touchAll, usernameError, } from "@lib/formValidation";
import { formatDate, getApiMessage as getMessage } from "@lib/ui";
import { useCallback, useEffect, useState } from "react";
const roleLabels = {
    jobseeker: "Job Seeker",
    employer: "Employer",
    admin: "Admin",
    superadmin: "Super Admin",
};
const statusLabels = {
    pending: "Pending",
    active: "Active",
    suspended: "Suspended",
};
const emptyPasswordForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};
const defaultParsedFieldSelection = {
    email: false,
    skills: true,
    experience: true,
    preferredLocation: true,
};
function formatRole(value) {
    return value ? roleLabels[value] : "Member";
}
function formatStatus(value) {
    return value ? statusLabels[value] : "Not set";
}
function validateProfileForm(form) {
    return {
        username: usernameError(form.username),
        email: emailError(form.email),
    };
}
function getRoleSummary(role) {
    if (role === "admin" || role === "superadmin") {
        return "Your admin access is separate from your career and hiring profile details.";
    }
    if (role === "employer") {
        return "You can keep company hiring details and still maintain candidate information.";
    }
    return "You can keep candidate details and add hiring information if your responsibilities change.";
}
function getProfileForm(data = {}) {
    return {
        username: data.username ?? "",
        email: data.email ?? "",
        skills: data.skills?.join(", ") ?? "",
        resumeUrl: data.resumeUrl ?? "",
        experience: typeof data.experience === "number" ? String(data.experience) : "",
        preferredLocation: data.preferredLocation ?? "",
        companyName: data.companyName ?? "",
        companyWebsite: data.companyWebsite ?? "",
        companySize: data.companySize ?? "",
    };
}
function buildProfilePayload(form, resumeUrl = form.resumeUrl) {
    return {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        skills: form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        resumeUrl: resumeUrl.trim(),
        experience: form.experience === "" ? undefined : Number(form.experience),
        preferredLocation: form.preferredLocation.trim(),
        companyName: form.companyName.trim(),
        companyWebsite: form.companyWebsite.trim(),
        companySize: form.companySize.trim(),
    };
}
function mergeCommaList(currentValue, nextItems = []) {
    const values = [
        ...String(currentValue ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ...nextItems.map((item) => String(item).trim()).filter(Boolean),
    ];
    return Array.from(new Set(values.map((item) => item.toLowerCase())))
        .map((key) => values.find((item) => item.toLowerCase() === key))
        .filter(Boolean)
        .join(", ");
}
function getParsedFieldRows(parsedResume, profileForm) {
    if (!parsedResume) {
        return [];
    }
    return [
        {
            key: "email",
            label: "Email",
            current: profileForm.email || "Not set",
            parsed: parsedResume.email || "",
        },
        {
            key: "skills",
            label: "Skills",
            current: profileForm.skills || "Not set",
            parsed: parsedResume.skills?.length ? parsedResume.skills.join(", ") : "",
        },
        {
            key: "experience",
            label: "Experience",
            current: profileForm.experience ? `${profileForm.experience} years` : "Not set",
            parsed: typeof parsedResume.experienceYears === "number"
                ? `${parsedResume.experienceYears} years`
                : "",
        },
        {
            key: "preferredLocation",
            label: "Preferred Location",
            current: profileForm.preferredLocation || "Not set",
            parsed: parsedResume.location || "",
        },
    ].filter((row) => row.parsed);
}
function getParsedFieldSelection(parsedResume) {
    const rows = getParsedFieldRows(parsedResume, {});
    return rows.reduce((selection, row) => ({
        ...selection,
        [row.key]: defaultParsedFieldSelection[row.key],
    }), {});
}
function validatePasswordForm(form) {
    return {
        currentPassword: form.currentPassword ? "" : "Current password is required.",
        newPassword: passwordError(form.newPassword, "New password"),
        confirmPassword: form.confirmPassword
            ? form.newPassword === form.confirmPassword
                ? ""
                : "Passwords do not match."
            : "Confirm password is required.",
    };
}
export default function ProfileClient() {
    const [profile, setProfile] = useState(null);
    const [profileForm, setProfileForm] = useState({
        username: "",
        email: "",
        skills: "",
        resumeUrl: "",
        experience: "",
        preferredLocation: "",
        companyName: "",
        companyWebsite: "",
        companySize: "",
    });
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [profileTouched, setProfileTouched] = useState({});
    const [passwordTouched, setPasswordTouched] = useState({});
    const [profileSubmitAttempted, setProfileSubmitAttempted] = useState(false);
    const [passwordSubmitAttempted, setPasswordSubmitAttempted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [parsedResume, setParsedResume] = useState(null);
    const [parsedFieldSelection, setParsedFieldSelection] = useState({});
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState(null);
    const profileErrors = validateProfileForm(profileForm);
    const passwordErrors = validatePasswordForm(passwordForm);
    const visibleProfileErrors = getVisibleErrors(profileErrors, profileTouched, profileSubmitAttempted);
    const visiblePasswordErrors = getVisibleErrors(passwordErrors, passwordTouched, passwordSubmitAttempted);
    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/profile");
            const body = (await response.json());
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body, "Unable to load profile."));
            }
            setProfile(body.data);
            setProfileForm(getProfileForm(body.data));
            setResumeFile(null);
            setParsedResume(null);
            setParsedFieldSelection({});
            setProfileTouched({});
            setProfileSubmitAttempted(false);
            setIsEditingProfile(false);
        }
        catch (caughtError) {
            setProfile(null);
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to load profile.");
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadProfile();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadProfile]);
    async function handleProfileSubmit(event) {
        event.preventDefault();
        setProfileSubmitAttempted(true);
        setProfileTouched(touchAll(profileErrors));
        setIsSavingProfile(true);
        setNotice(null);
        setError(null);
        if (hasValidationErrors(profileErrors)) {
            setIsSavingProfile(false);
            return;
        }
        try {
            let resumeUrl = profileForm.resumeUrl;
            if (resumeFile) {
                const uploadData = new FormData();
                uploadData.append("resume", resumeFile);
                const uploadResponse = await fetch("/api/profile/resume", {
                    method: "POST",
                    body: uploadData,
                });
                const uploadBody = await uploadResponse.json();
                if (!uploadResponse.ok || !uploadBody.data?.resumeUrl) {
                    throw new Error(getMessage(uploadBody, "Unable to upload resume."));
                }
                resumeUrl = uploadBody.data.resumeUrl;
            }
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(buildProfilePayload(profileForm, resumeUrl)),
            });
            const body = (await response.json());
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body, "Unable to update profile."));
            }
            setProfile(body.data);
            setProfileForm(getProfileForm(body.data));
            setResumeFile(null);
            setParsedResume(null);
            setParsedFieldSelection({});
            setProfileTouched({});
            setProfileSubmitAttempted(false);
            setIsEditingProfile(false);
            setNotice("Profile updated.");
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to update profile.");
        }
        finally {
            setIsSavingProfile(false);
        }
    }
    function startProfileEdit() {
        setIsEditingProfile(true);
        setNotice(null);
        setError(null);
    }
    function cancelProfileEdit() {
        setProfileForm(getProfileForm(profile ?? {}));
        setResumeFile(null);
        setParsedResume(null);
        setParsedFieldSelection({});
        setProfileTouched({});
        setProfileSubmitAttempted(false);
        setIsEditingProfile(false);
        setNotice(null);
        setError(null);
    }
    async function handlePasswordSubmit(event) {
        event.preventDefault();
        setPasswordSubmitAttempted(true);
        setPasswordTouched(touchAll(passwordErrors));
        setNotice(null);
        setError(null);
        if (hasValidationErrors(passwordErrors)) {
            return;
        }
        setIsSavingPassword(true);
        try {
            const response = await fetch("/api/profile/password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const body = (await response.json());
            if (!response.ok) {
                throw new Error(getMessage(body, "Unable to change password."));
            }
            setPasswordForm(emptyPasswordForm);
            setPasswordTouched({});
            setPasswordSubmitAttempted(false);
            setNotice(getMessage(body, "Password changed."));
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to change password.");
        }
        finally {
            setIsSavingPassword(false);
        }
    }
    function updateProfileField(field, value) {
        setProfileForm((current) => ({
            ...current,
            [field]: value,
        }));
    }
    function markProfileFieldTouched(field) {
        setProfileTouched((current) => ({ ...current, [field]: true }));
    }
    function handleResumeChange(event) {
        setResumeFile(event.target.files?.[0] ?? null);
        setParsedResume(null);
        setParsedFieldSelection({});
    }
    async function handleParseResume() {
        if (!resumeFile && !profileForm.resumeUrl) {
            setError("Upload or save a resume before parsing.");
            return;
        }
        setIsParsingResume(true);
        setNotice(null);
        setError(null);
        try {
            const formData = new FormData();
            if (resumeFile) {
                formData.append("resume", resumeFile);
            }
            else {
                formData.append("resumeUrl", profileForm.resumeUrl);
            }
            const response = await fetch("/api/profile/resume/parse", {
                method: "POST",
                body: formData,
            });
            const body = await response.json();
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body, "Unable to parse resume."));
            }
            const parsed = body.data;
            setParsedResume(parsed);
            setParsedFieldSelection(getParsedFieldSelection(parsed));
            setIsEditingProfile(true);
            setNotice("Resume parsed. Review detected fields before applying them.");
        }
        catch (caughtError) {
            setError(caughtError instanceof Error
                ? caughtError.message
                : "Unable to parse resume.");
        }
        finally {
            setIsParsingResume(false);
        }
    }
    function toggleParsedField(field) {
        setParsedFieldSelection((current) => ({
            ...current,
            [field]: !current[field],
        }));
    }
    function applyParsedResumeFields() {
        if (!parsedResume) {
            return;
        }
        setProfileForm((current) => ({
            ...current,
            email: parsedFieldSelection.email && parsedResume.email
                ? parsedResume.email
                : current.email,
            skills: parsedFieldSelection.skills && parsedResume.skills?.length
                ? mergeCommaList(current.skills, parsedResume.skills)
                : current.skills,
            experience: parsedFieldSelection.experience &&
                typeof parsedResume.experienceYears === "number"
                ? String(parsedResume.experienceYears)
                : current.experience,
            preferredLocation: parsedFieldSelection.preferredLocation && parsedResume.location
                ? parsedResume.location
                : current.preferredLocation,
        }));
        setIsEditingProfile(true);
        setNotice("Selected resume details were added to the form. Review and save your profile.");
    }
    const parsedFieldRows = getParsedFieldRows(parsedResume, profileForm);
    const hasSelectedParsedFields = parsedFieldRows.some((row) => parsedFieldSelection[row.key]);
    return (<section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="site-accent text-xs font-semibold uppercase tracking-widest">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Profile
            </h1>
            <p className="site-muted mt-2 max-w-2xl text-sm leading-6">
              Keep one profile for your account, candidate details, and hiring
              identity even when your platform role changes.
            </p>
          </div>
          <span className="site-badge inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold">
            <Icon name="user"/>
            {formatRole(profile?.role)}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Account Type</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatRole(profile?.role)}
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Status</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatStatus(profile?.status)}
            </p>
          </div>
          <div className="site-border site-panel rounded-lg border p-4">
            <p className="site-muted text-xs font-medium">Joined</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatDate(profile?.createdAt)}
            </p>
          </div>
        </div>

        <StatusNotice tone="success">{notice}</StatusNotice>
        <StatusNotice>{error}</StatusNotice>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_414px]">
          <div className="site-border site-card rounded-lg border">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--site-border)] px-4 py-3">
              <div>
                <h2 className="font-semibold">Profile Details</h2>
                <p className="site-muted mt-1 text-xs">
                  {getRoleSummary(profile?.role)}
                </p>
              </div>
              <button type="button" onClick={isEditingProfile ? cancelProfileEdit : startProfileEdit} disabled={isLoading || isSavingProfile} className="site-border site-field inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border disabled:opacity-60" aria-label={isEditingProfile ? "Cancel profile editing" : "Edit profile"}>
                <Icon name={isEditingProfile ? "x" : "edit"}/>
              </button>
            </div>

            {isLoading ? (<div className="site-muted p-6 text-sm">Loading profile...</div>) : (<form onSubmit={handleProfileSubmit} noValidate className="space-y-4 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Username</span>
                    <input value={profileForm.username} onChange={(event) => updateProfileField("username", event.target.value)} onBlur={() => markProfileFieldTouched("username")} disabled={!isEditingProfile} aria-invalid={Boolean(visibleProfileErrors.username)} aria-describedby={visibleProfileErrors.username ? "profile-username-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" minLength={3} maxLength={50} autoComplete="username" required placeholder="yourname"/>
                    <FieldError id="profile-username-error" message={visibleProfileErrors.username}/>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input type="email" value={profileForm.email} onChange={(event) => updateProfileField("email", event.target.value)} onBlur={() => markProfileFieldTouched("email")} disabled={!isEditingProfile} aria-invalid={Boolean(visibleProfileErrors.email)} aria-describedby={visibleProfileErrors.email ? "profile-email-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" autoComplete="email" required placeholder="you@example.com"/>
                    <FieldError id="profile-email-error" message={visibleProfileErrors.email}/>
                  </label>
                </div>

                <section className="border-t border-[var(--site-border)] pt-4">
                  <div>
                    <h3 className="text-sm font-semibold">Candidate Profile</h3>
                    <p className="site-muted mt-1 text-xs">
                      Career details stay available even if your account role is
                      admin or employer.
                    </p>
                  </div>
                  <div className="mt-4 rounded-md border border-[var(--site-border)] p-3">
                    <div>
                      <span className="text-sm font-medium">Resume</span>
                      <div className="mt-1 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <label className="block">
                          <span className="sr-only">Resume</span>
                          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeChange} disabled={!isEditingProfile || isParsingResume} className="site-field w-full rounded-md border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[var(--site-panel)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--site-fg)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"/>
                        </label>
                        <button type="button" onClick={handleParseResume} disabled={isParsingResume || (!resumeFile && !profileForm.resumeUrl)} className="site-border site-field inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold disabled:opacity-60">
                          <Icon name="file"/>
                          {isParsingResume ? "Parsing..." : "Parse Resume"}
                        </button>
                      </div>
                      <p className="site-muted mt-1 text-xs">
                        PDF, DOC, or DOCX up to 5 MB.
                      </p>
                      {resumeFile ? (<p className="mt-1 text-xs font-semibold">
                          Selected: {resumeFile.name}
                        </p>) : null}
                      {profileForm.resumeUrl ? (<a href={profileForm.resumeUrl} target="_blank" rel="noopener noreferrer" className="site-link mt-1 inline-block break-all text-xs font-semibold">
                          Open current resume
                        </a>) : (<p className="site-muted mt-1 text-xs">No resume uploaded.</p>)}
                    </div>
                    <p className="site-muted mt-3 text-xs">
                      Parse the resume first to fill profile details faster. If parsing misses anything, add or edit the details manually below.
                    </p>
                    {parsedResume ? (<div className="mt-4 space-y-3">
                        <div className="rounded-md bg-[var(--site-panel)] p-3 text-xs">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold">Review Parsed Resume</p>
                              <p className="site-muted mt-1">
                                Choose what to add to the form, then save the profile.
                              </p>
                            </div>
                            {parsedResume.fullName ? (<p className="site-muted font-medium">
                                Detected: {parsedResume.fullName}
                              </p>) : null}
                          </div>
                        </div>
                        {parsedFieldRows.length ? (<div className="space-y-2">
                            {parsedFieldRows.map((row) => (<label key={row.key} className="site-border grid gap-3 rounded-md border p-3 text-xs sm:grid-cols-[auto_1fr_1fr] sm:items-start">
                                <input type="checkbox" checked={Boolean(parsedFieldSelection[row.key])} onChange={() => toggleParsedField(row.key)} className="mt-1 h-4 w-4 rounded border-[var(--site-border)]"/>
                                <div>
                                  <p className="font-semibold">{row.label}</p>
                                  <p className="site-muted mt-1">Current</p>
                                  <p className="mt-1 break-words font-medium">
                                    {row.current}
                                  </p>
                                </div>
                                <div>
                                  <p className="site-muted">Parsed</p>
                                  <p className="mt-1 break-words font-semibold">
                                    {row.parsed}
                                  </p>
                                </div>
                              </label>))}
                          </div>) : (<p className="site-muted text-xs">
                            No profile fields were detected from this resume.
                          </p>)}
                        <button type="button" onClick={applyParsedResumeFields} disabled={!hasSelectedParsedFields} className="site-button inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold disabled:opacity-60 sm:w-auto">
                          <Icon name="check"/>
                          Apply Selected Details
                        </button>
                      </div>) : null}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold">Manual Details</h4>
                    <p className="site-muted mt-1 text-xs">
                      Edit these fields directly when parsing is skipped or needs correction.
                    </p>
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium">Skills</span>
                      <input value={profileForm.skills} onChange={(event) => updateProfileField("skills", event.target.value)} disabled={!isEditingProfile} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="React, Node.js, Design"/>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Experience</span>
                      <input type="number" min={0} value={profileForm.experience} onChange={(event) => updateProfileField("experience", event.target.value)} disabled={!isEditingProfile} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="3"/>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Preferred Location</span>
                      <input value={profileForm.preferredLocation} onChange={(event) => updateProfileField("preferredLocation", event.target.value)} disabled={!isEditingProfile} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="Remote or Dhaka"/>
                    </label>
                  </div>
                </section>

                <section className="border-t border-[var(--site-border)] pt-4">
                  <div>
                    <h3 className="text-sm font-semibold">Hiring Profile</h3>
                    <p className="site-muted mt-1 text-xs">
                      Company details are kept with your account for current or
                      future hiring workflows.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium">Company Name</span>
                      <input value={profileForm.companyName} onChange={(event) => updateProfileField("companyName", event.target.value)} disabled={!isEditingProfile} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="Acme Inc."/>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Company Website</span>
                      <input value={profileForm.companyWebsite} onChange={(event) => updateProfileField("companyWebsite", event.target.value)} disabled={!isEditingProfile} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="https://..."/>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Company Size</span>
                      <input value={profileForm.companySize} onChange={(event) => updateProfileField("companySize", event.target.value)} disabled={!isEditingProfile} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-70" placeholder="11-50"/>
                    </label>
                  </div>
                </section>

                <dl className="grid gap-4 border-t border-[var(--site-border)] pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="site-muted text-xs font-medium">User ID</dt>
                    <dd className="mt-1 break-all text-sm font-semibold">
                      {profile?.id ?? "Not available"}
                    </dd>
                  </div>
                  <div>
                    <dt className="site-muted text-xs font-medium">Updated</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {formatDate(profile?.updatedAt)}
                    </dd>
                  </div>
                </dl>

                {isEditingProfile ? (<div className="flex flex-col gap-2 sm:flex-row">
                    <button type="submit" disabled={isSavingProfile} className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70">
                      <Icon name="check"/>
                      {isSavingProfile ? "Saving..." : "Save Profile"}
                    </button>
                    <button type="button" onClick={cancelProfileEdit} disabled={isSavingProfile} className="site-border site-field inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-70">
                      <Icon name="x"/>
                      Cancel
                    </button>
                  </div>) : null}
              </form>)}
          </div>

          <aside className="site-border site-card rounded-lg border">
            <div className="border-b border-[var(--site-border)] px-4 py-3">
              <h2 className="font-semibold">Change Password</h2>
              <p className="site-muted mt-1 text-xs">
                Use your current password before setting a new one.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4 p-4">
              <label className="block">
                <span className="text-sm font-medium">Current Password</span>
                <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({
            ...current,
            currentPassword: event.target.value,
        }))} onBlur={() => setPasswordTouched((current) => ({ ...current, currentPassword: true }))} aria-invalid={Boolean(visiblePasswordErrors.currentPassword)} aria-describedby={visiblePasswordErrors.currentPassword ? "profile-current-password-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" autoComplete="current-password" required/>
                <FieldError id="profile-current-password-error" message={visiblePasswordErrors.currentPassword}/>
              </label>

              <label className="block">
                <span className="text-sm font-medium">New Password</span>
                <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({
            ...current,
            newPassword: event.target.value,
        }))} onBlur={() => setPasswordTouched((current) => ({ ...current, newPassword: true }))} aria-invalid={Boolean(visiblePasswordErrors.newPassword)} aria-describedby={visiblePasswordErrors.newPassword ? "profile-new-password-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={8} maxLength={50} autoComplete="new-password" required/>
                <FieldError id="profile-new-password-error" message={visiblePasswordErrors.newPassword}/>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Confirm Password</span>
                <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({
            ...current,
            confirmPassword: event.target.value,
        }))} onBlur={() => setPasswordTouched((current) => ({ ...current, confirmPassword: true }))} aria-invalid={Boolean(visiblePasswordErrors.confirmPassword)} aria-describedby={visiblePasswordErrors.confirmPassword ? "profile-confirm-password-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={8} maxLength={50} autoComplete="new-password" required/>
                <FieldError id="profile-confirm-password-error" message={visiblePasswordErrors.confirmPassword}/>
              </label>

              <button type="submit" disabled={isSavingPassword} className="site-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70">
                <Icon name="check"/>
                {isSavingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </section>);
}
