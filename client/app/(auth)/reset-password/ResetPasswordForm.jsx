"use client";
import FieldError from "@components/forms/FieldError";
import LoadingCircle from "@components/LoadingCircle";
import StatusNotice from "@components/StatusNotice";
import { requestJson } from "@lib/clientApi";
import { getVisibleErrors, hasValidationErrors, passwordError, touchAll, } from "@lib/formValidation";
import { getApiMessage } from "@lib/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialState = {
    newPassword: "",
    confirmPassword: "",
};

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
            const body = await requestJson(`/auth/reset-password?token=${encodeURIComponent(token)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newPassword: form.newPassword,
                }),
            }, "Unable to reset password.");

            setSuccess(getApiMessage(body, "Password has been reset successfully."));
            setForm(initialState);
            setTouched({});
            setSubmitAttempted(false);
            window.setTimeout(() => {
                router.push("/login");
            }, 1200);
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to reach the server. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (<form onSubmit={handleSubmit} noValidate className="site-border site-card site-elevated rounded-lg border p-4">
      <StatusNotice className="mb-4 text-xs">{!token ? "Reset token is missing. Please request a new reset link." : ""}</StatusNotice>

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

      <StatusNotice className="mt-4 text-xs">{error}</StatusNotice>
      <StatusNotice className="mt-4 text-xs" tone="success">{success}</StatusNotice>

      <button type="submit" disabled={isSubmitting || !token} className="site-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed">
        {isSubmitting ? (<LoadingCircle className="h-3.5 w-3.5" label="Resetting password" />) : null}
        {isSubmitting ? "Resetting" : "Reset Password"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Need a new link?{" "}
        <Link href="/forgot-password" className="site-accent font-semibold underline-offset-4 hover:underline">
          Request reset
        </Link>
      </p>
    </form>);
}
