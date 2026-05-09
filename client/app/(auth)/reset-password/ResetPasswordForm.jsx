"use client";
import FieldError from "@components/forms/FieldError";
import { getVisibleErrors, hasValidationErrors, passwordError, touchAll, } from "@lib/formValidation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialState = {
    newPassword: "",
    confirmPassword: "",
};

function getMessage(body, fallback) {
    return body.error ?? body.message ?? fallback;
}

function validateResetPasswordForm(form) {
    return {
        newPassword: passwordError(form.newPassword, "New password"),
        confirmPassword: form.confirmPassword
            ? form.newPassword === form.confirmPassword
                ? ""
                : "Passwords do not match."
            : "Confirm password is required.",
    };
}

export default function ResetPasswordForm({ token }) {
    const router = useRouter();
    const [form, setForm] = useState(initialState);
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validationErrors = validateResetPasswordForm(form);
    const visibleErrors = getVisibleErrors(validationErrors, touched, submitAttempted);

    function updateField(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitAttempted(true);
        setTouched(touchAll(validationErrors));
        setError("");
        setSuccess("");

        if (!token) {
            setError("Reset token is missing. Please request a new reset link.");
            return;
        }

        if (hasValidationErrors(validationErrors)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newPassword: form.newPassword,
                }),
            });
            const body = await response.json();

            if (!response.ok) {
                setError(getMessage(body, "Unable to reset password."));
                return;
            }

            setSuccess(getMessage(body, "Password has been reset successfully."));
            setForm(initialState);
            setTouched({});
            setSubmitAttempted(false);
            window.setTimeout(() => {
                router.push("/login");
            }, 1200);
        }
        catch {
            setError("Unable to reach the server. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (<form onSubmit={handleSubmit} noValidate className="site-border site-card site-elevated rounded-lg border p-4">
      {!token ? (<p className="site-danger mb-4 rounded-md border px-3 py-2 text-xs">
          Reset token is missing. Please request a new reset link.
        </p>) : null}

      <label className="site-soft block text-xs font-medium">
        New Password
        <input type="password" value={form.newPassword} onChange={(event) => updateField("newPassword", event.target.value)} onBlur={() => setTouched((current) => ({ ...current, newPassword: true }))} aria-invalid={Boolean(visibleErrors.newPassword)} aria-describedby={visibleErrors.newPassword ? "reset-new-password-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="At least 8 characters" autoComplete="new-password" required/>
        <FieldError id="reset-new-password-error" message={visibleErrors.newPassword}/>
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Confirm Password
        <input type="password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))} aria-invalid={Boolean(visibleErrors.confirmPassword)} aria-describedby={visibleErrors.confirmPassword ? "reset-confirm-password-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="Repeat new password" autoComplete="new-password" required/>
        <FieldError id="reset-confirm-password-error" message={visibleErrors.confirmPassword}/>
      </label>

      {error ? (<p className="site-danger mt-4 rounded-md border px-3 py-2 text-xs">
          {error}
        </p>) : null}

      {success ? (<p className="site-success mt-4 rounded-md border px-3 py-2 text-xs">
          {success}
        </p>) : null}

      <button type="submit" disabled={isSubmitting || !token} className="site-button mt-5 w-full rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed">
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Need a new link?{" "}
        <Link href="/forgot-password" className="site-accent font-semibold underline-offset-4 hover:underline">
          Request reset
        </Link>
      </p>
    </form>);
}
