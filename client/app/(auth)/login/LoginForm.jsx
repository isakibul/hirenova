"use client";
import FieldError from "@components/forms/FieldError";
import { useAuth } from "@components/auth/AuthProvider";
import {
  emailError,
  getVisibleErrors,
  hasValidationErrors,
  required,
  touchAll,
} from "@lib/formValidation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
function validateLoginForm(form) {
  return {
    email: emailError(form.email),
    password: required(form.password, "Password"),
  };
}
export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationErrors = validateLoginForm(form);
  const visibleErrors = getVisibleErrors(
    validationErrors,
    touched,
    submitAttempted,
  );
  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  }
  function markTouched(field) {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouched(touchAll(validationErrors));
    setError("");
    if (hasValidationErrors(validationErrors)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await login({
        email: form.email,
        password: form.password,
      });
      router.push("/jobs");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reach the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="site-border site-card site-elevated rounded-lg border p-4"
    >
      <label className="site-soft block text-xs font-medium">
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          onBlur={() => markTouched("email")}
          aria-invalid={Boolean(visibleErrors.email)}
          aria-describedby={
            visibleErrors.email ? "login-email-error" : undefined
          }
          className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FieldError id="login-email-error" message={visibleErrors.email} />
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          onBlur={() => markTouched("password")}
          aria-invalid={Boolean(visibleErrors.password)}
          aria-describedby={
            visibleErrors.password ? "login-password-error" : undefined
          }
          className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
        <FieldError
          id="login-password-error"
          message={visibleErrors.password}
        />
      </label>

      <div className="mt-1 text-right">
        <Link
          href="/forgot-password"
          className="site-accent text-xs font-semibold underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {error ? (
        <p className="site-danger mt-4 rounded-md border px-3 py-2 text-xs">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="site-button mt-5 w-full rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="site-accent font-semibold underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
