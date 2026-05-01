"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type SignupState = {
  username: string;
  email: string;
  password: string;
  role: "jobseeker" | "employer";
};

type ApiResponse = {
  message?: string;
  error?: string;
};

const initialState: SignupState = {
  username: "",
  email: "",
  password: "",
  role: "jobseeker",
};

function getMessage(body: ApiResponse, fallback: string) {
  return body.error ?? body.message ?? fallback;
}

export default function SignupForm({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const [form, setForm] = useState<SignupState>({
    ...initialState,
    email: initialEmail,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const body = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setError(getMessage(body, "Unable to create account"));
        return;
      }

      setSuccess(
        getMessage(body, "Account created. Please confirm your email.")
      );
      setForm(initialState);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="site-border site-card site-elevated rounded-lg border p-4"
    >
      <label className="site-soft block text-xs font-medium">
        Username
        <input
          type="text"
          value={form.username}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              username: event.target.value,
            }))
          }
          className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          placeholder="yourname"
          minLength={3}
          maxLength={50}
          required
        />
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          placeholder="At least 8 characters"
          minLength={8}
          maxLength={50}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
          title="Password must include uppercase, lowercase, and number"
          required
        />
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Account type
        <select
          value={form.role}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              role: event.target.value as SignupState["role"],
            }))
          }
          className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
        >
          <option value="jobseeker">Job seeker</option>
          <option value="employer">Employer</option>
        </select>
      </label>

      {error ? (
        <p className="site-danger mt-4 rounded-md border px-3 py-2 text-xs">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="site-success mt-4 rounded-md border px-3 py-2 text-xs">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="site-button mt-5 w-full rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Have an account?{" "}
        <Link
          href="/login"
          className="site-accent font-semibold underline-offset-4 hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
