"use client";
import FieldError from "@components/forms/FieldError";
import PasswordField from "@components/forms/PasswordField";
import { useAuth } from "@components/auth/AuthProvider";
import LoadingCircle from "@components/LoadingCircle";
import useValidatedForm from "@components/forms/useValidatedForm";
import {
  emailError,
  required,
} from "@lib/formValidation";
import { getCaughtErrorMessage } from "@lib/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
function validateLoginForm(form) {
  return {
    email: emailError(form.email),
    password: required(form.password, "Password"),
  };
}
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { form, markTouched, prepareSubmit, updateField: setFieldValue, visibleErrors } = useValidatedForm({
    email: "",
    password: "",
  }, validateLoginForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  function updateField(field, value) {
    setFieldValue(field, value);
    setError("");
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!prepareSubmit()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await login({
        email: form.email,
        password: form.password,
      });
      const nextPath = searchParams.get("next");
      router.push(
        nextPath?.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/jobs",
      );
      router.refresh();
    } catch (caughtError) {
      setError(getCaughtErrorMessage(caughtError, "Unable to reach the server. Please try again."));
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
        <PasswordField
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          onBlur={() => markTouched("password")}
          aria-invalid={Boolean(visibleErrors.password)}
          aria-describedby={
            visibleErrors.password ? "login-password-error" : undefined
          }
          containerClassName="mt-1.5"
          className="site-field w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
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
        className="site-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <LoadingCircle className="h-3.5 w-3.5" label="Logging in" />
        ) : null}
        {isSubmitting ? "Logging in" : "Login"}
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
