"use client";
import FieldError from "@components/forms/FieldError";
import { emailError, getVisibleErrors, hasValidationErrors, touchAll, } from "@lib/formValidation";
import Link from "next/link";
import { useState } from "react";

function getMessage(body, fallback) {
    return body.error ?? body.message ?? fallback;
}

function validateForgotPasswordForm(form) {
    return {
        email: emailError(form.email),
    };
}

export default function ForgotPasswordForm() {
    const [form, setForm] = useState({ email: "" });
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validationErrors = validateForgotPasswordForm(form);
    const visibleErrors = getVisibleErrors(validationErrors, touched, submitAttempted);

    function updateEmail(value) {
        setForm({ email: value });
        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitAttempted(true);
        setTouched(touchAll(validationErrors));
        setError("");
        setSuccess("");

        if (hasValidationErrors(validationErrors)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.email.trim().toLowerCase(),
                }),
            });
            const body = await response.json();

            if (!response.ok) {
                setError(getMessage(body, "Unable to send reset link."));
                return;
            }

            setSuccess(getMessage(body, "Password reset link sent to your email."));
            setForm({ email: "" });
            setTouched({});
            setSubmitAttempted(false);
        }
        catch {
            setError("Unable to reach the server. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (<form onSubmit={handleSubmit} noValidate className="site-border site-card site-elevated rounded-lg border p-4">
      <label className="site-soft block text-xs font-medium">
        Email
        <input type="email" value={form.email} onChange={(event) => updateEmail(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, email: true }))} aria-invalid={Boolean(visibleErrors.email)} aria-describedby={visibleErrors.email ? "forgot-email-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="you@example.com" autoComplete="email" required/>
        <FieldError id="forgot-email-error" message={visibleErrors.email}/>
      </label>

      {error ? (<p className="site-danger mt-4 rounded-md border px-3 py-2 text-xs">
          {error}
        </p>) : null}

      {success ? (<p className="site-success mt-4 rounded-md border px-3 py-2 text-xs">
          {success}
        </p>) : null}

      <button type="submit" disabled={isSubmitting} className="site-button mt-5 w-full rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed">
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Remembered your password?{" "}
        <Link href="/login" className="site-accent font-semibold underline-offset-4 hover:underline">
          Login
        </Link>
      </p>
    </form>);
}
