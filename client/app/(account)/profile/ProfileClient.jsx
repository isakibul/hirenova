"use client";
import FieldError from "@components/forms/FieldError";
import Icon from "@components/Icon";
import { emailError, getVisibleErrors, hasValidationErrors, passwordError, touchAll, usernameError, } from "@lib/formValidation";
import { useCallback, useEffect, useState } from "react";
const roleLabels = {
    jobseeker: "Job Seeker",
    employer: "Employer",
    admin: "Admin",
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
function getMessage(response, fallback = "Something went wrong.") {
    if (response.errors?.length) {
        return response.errors.join(" ");
    }
    return response.error ?? response.message ?? fallback;
}
function formatDate(value) {
    if (!value) {
        return "Not available";
    }
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}
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
    });
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [profileTouched, setProfileTouched] = useState({});
    const [passwordTouched, setPasswordTouched] = useState({});
    const [profileSubmitAttempted, setProfileSubmitAttempted] = useState(false);
    const [passwordSubmitAttempted, setPasswordSubmitAttempted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
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
            setProfileForm({
                username: body.data.username ?? "",
                email: body.data.email ?? "",
            });
            setProfileTouched({});
            setProfileSubmitAttempted(false);
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
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: profileForm.username.trim(),
                    email: profileForm.email.trim().toLowerCase(),
                }),
            });
            const body = (await response.json());
            if (!response.ok || !body.data) {
                throw new Error(getMessage(body, "Unable to update profile."));
            }
            setProfile(body.data);
            setProfileForm({
                username: body.data.username ?? "",
                email: body.data.email ?? "",
            });
            setProfileTouched({});
            setProfileSubmitAttempted(false);
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
              Review your account details, update your public identity, and keep
              your password current.
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

        {(notice || error) && (<div className={`mt-5 rounded-lg border px-4 py-3 text-sm ${error ? "site-danger" : "site-success"}`}>
            {error ?? notice}
          </div>)}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_414px]">
          <div className="site-border site-card rounded-lg border">
            <div className="border-b border-[var(--site-border)] px-4 py-3">
              <h2 className="font-semibold">Profile Details</h2>
              <p className="site-muted mt-1 text-xs">
                These details come from the authenticated backend profile.
              </p>
            </div>

            {isLoading ? (<div className="site-muted p-6 text-sm">Loading profile...</div>) : (<form onSubmit={handleProfileSubmit} noValidate className="space-y-4 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Username</span>
                    <input value={profileForm.username} onChange={(event) => setProfileForm((current) => ({
                ...current,
                username: event.target.value,
            }))} onBlur={() => setProfileTouched((current) => ({ ...current, username: true }))} aria-invalid={Boolean(visibleProfileErrors.username)} aria-describedby={visibleProfileErrors.username ? "profile-username-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" minLength={3} maxLength={50} autoComplete="username" required placeholder="yourname"/>
                    <FieldError id="profile-username-error" message={visibleProfileErrors.username}/>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({
                ...current,
                email: event.target.value,
            }))} onBlur={() => setProfileTouched((current) => ({ ...current, email: true }))} aria-invalid={Boolean(visibleProfileErrors.email)} aria-describedby={visibleProfileErrors.email ? "profile-email-error" : undefined} className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" autoComplete="email" required placeholder="you@example.com"/>
                    <FieldError id="profile-email-error" message={visibleProfileErrors.email}/>
                  </label>
                </div>

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

                <button type="submit" disabled={isSavingProfile} className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70">
                  <Icon name="check"/>
                  {isSavingProfile ? "Saving..." : "Save Profile"}
                </button>
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
