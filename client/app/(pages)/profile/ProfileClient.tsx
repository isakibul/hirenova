"use client";

import Icon from "@/app/components/Icon";
import { FormEvent, useCallback, useEffect, useState } from "react";

type UserRole = "jobseeker" | "employer" | "admin";
type UserStatus = "pending" | "active" | "suspended";

type Profile = {
  id: string;
  username?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
};

type ProfileResponse = {
  data?: Profile;
  message?: string;
  error?: string;
  errors?: string[];
};

type ProfileFormState = {
  username: string;
  email: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const roleLabels: Record<UserRole, string> = {
  jobseeker: "Job Seeker",
  employer: "Employer",
  admin: "Admin",
};

const statusLabels: Record<UserStatus, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
};

const emptyPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function getMessage(
  response: ProfileResponse,
  fallback = "Something went wrong.",
) {
  if (response.errors?.length) {
    return response.errors.join(" ");
  }

  return response.error ?? response.message ?? fallback;
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatRole(value?: UserRole) {
  return value ? roleLabels[value] : "Member";
}

function formatStatus(value?: UserStatus) {
  return value ? statusLabels[value] : "Not set";
}

export default function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    username: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(emptyPasswordForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile");
      const body = (await response.json()) as ProfileResponse;

      if (!response.ok || !body.data) {
        throw new Error(getMessage(body, "Unable to load profile."));
      }

      setProfile(body.data);
      setProfileForm({
        username: body.data.username ?? "",
        email: body.data.email ?? "",
      });
    } catch (caughtError) {
      setProfile(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load profile.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProfile(true);
    setNotice(null);
    setError(null);

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
      const body = (await response.json()) as ProfileResponse;

      if (!response.ok || !body.data) {
        throw new Error(getMessage(body, "Unable to update profile."));
      }

      setProfile(body.data);
      setProfileForm({
        username: body.data.username ?? "",
        email: body.data.email ?? "",
      });
      setNotice("Profile updated.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
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
      const body = (await response.json()) as ProfileResponse;

      if (!response.ok) {
        throw new Error(getMessage(body, "Unable to change password."));
      }

      setPasswordForm(emptyPasswordForm);
      setNotice(getMessage(body, "Password changed."));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to change password.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <section className="px-5 py-8 md:px-[6vw] lg:px-[8vw]">
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
            <Icon name="user" />
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

        {(notice || error) && (
          <div
            className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
              error ? "site-danger" : "site-success"
            }`}
          >
            {error ?? notice}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_414px]">
          <div className="site-border site-card rounded-lg border">
            <div className="border-b border-[var(--site-border)] px-4 py-3">
              <h2 className="font-semibold">Profile Details</h2>
              <p className="site-muted mt-1 text-xs">
                These details come from the authenticated backend profile.
              </p>
            </div>

            {isLoading ? (
              <div className="site-muted p-6 text-sm">Loading profile...</div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Username</span>
                    <input
                      value={profileForm.username}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          username: event.target.value,
                        }))
                      }
                      className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                      minLength={3}
                      maxLength={50}
                      required
                      placeholder="yourname"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                      required
                      placeholder="you@example.com"
                    />
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

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="site-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70"
                >
                  <Icon name="check" />
                  {isSavingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>
            )}
          </div>

          <aside className="site-border site-card rounded-lg border">
            <div className="border-b border-[var(--site-border)] px-4 py-3">
              <h2 className="font-semibold">Change Password</h2>
              <p className="site-muted mt-1 text-xs">
                Use your current password before setting a new one.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 p-4">
              <label className="block">
                <span className="text-sm font-medium">Current Password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">New Password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  minLength={8}
                  maxLength={50}
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
                  title="Password must include uppercase, lowercase, and number"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Confirm Password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="site-field mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  minLength={8}
                  maxLength={50}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isSavingPassword}
                className="site-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-70"
              >
                <Icon name="check" />
                {isSavingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}
