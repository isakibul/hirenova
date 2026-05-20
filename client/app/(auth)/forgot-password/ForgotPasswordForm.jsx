"use client";
import FieldError from "@components/forms/FieldError";
import LoadingCircle from "@components/LoadingCircle";
import StatusNotice from "@components/StatusNotice";
import useValidatedForm from "@components/forms/useValidatedForm";
import { requestJson } from "@lib/clientApi";
import { emailError } from "@lib/formValidation";
import { getApiMessage, getCaughtErrorMessage } from "@lib/ui";
import Link from "next/link";
import { useState } from "react";

function validateForgotPasswordForm(form) {
    return {
        email: emailError(form.email),
    };
}

export default function ForgotPasswordForm() {
    const { form, markTouched, prepareSubmit, resetForm, updateField, visibleErrors } = useValidatedForm({ email: "" }, validateForgotPasswordForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateEmail(value) {
        updateField("email", value);
        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!prepareSubmit()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const body = await requestJson("/auth/forgot-password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.email.trim().toLowerCase(),
                }),
            }, "Unable to send reset link.");

            setSuccess(getApiMessage(body, "Password reset link sent to your email."));
            resetForm({ email: "" });
        }
        catch (caughtError) {
            setError(getCaughtErrorMessage(caughtError, "Unable to reach the server. Please try again."));
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (<form onSubmit={handleSubmit} noValidate className="site-border site-card site-elevated rounded-lg border p-4">
      <label className="site-soft block text-xs font-medium">
        Email
        <input type="email" value={form.email} onChange={(event) => updateEmail(event.target.value)} onBlur={() => markTouched("email")} aria-invalid={Boolean(visibleErrors.email)} aria-describedby={visibleErrors.email ? "forgot-email-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="you@example.com" autoComplete="email" required/>
        <FieldError id="forgot-email-error" message={visibleErrors.email}/>
      </label>

      <StatusNotice className="mt-4 text-xs">{error}</StatusNotice>
      <StatusNotice className="mt-4 text-xs" tone="success">{success}</StatusNotice>

      <button type="submit" disabled={isSubmitting} className="site-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed">
        {isSubmitting ? (<LoadingCircle className="h-3.5 w-3.5" label="Sending reset link" />) : null}
        {isSubmitting ? "Sending" : "Send Reset Link"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Remembered your password?{" "}
        <Link href="/login" className="site-accent font-semibold underline-offset-4 hover:underline">
          Login
        </Link>
      </p>
    </form>);
}
