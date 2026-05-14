"use client";
import FieldError from "@components/forms/FieldError";
import LoadingCircle from "@components/LoadingCircle";
import SelectField from "@components/forms/SelectField";
import StatusNotice from "@components/StatusNotice";
import { requestJson } from "@lib/clientApi";
import { emailError, getVisibleErrors, hasValidationErrors, passwordError, touchAll, usernameError, } from "@lib/formValidation";
import { getApiMessage } from "@lib/ui";
import Link from "next/link";
import { useState } from "react";
const initialState = {
    username: "",
    email: "",
    password: "",
    role: "jobseeker",
};
const accountTypeOptions = [
    { value: "jobseeker", label: "Job seeker" },
    { value: "employer", label: "Employer" },
];
function validateSignupForm(form) {
    return {
        username: usernameError(form.username),
        email: emailError(form.email),
        password: passwordError(form.password),
        role: ["jobseeker", "employer"].includes(form.role)
            ? ""
            : "Choose a valid account type.",
    };
}
export default function SignupForm({ initialEmail = "", }) {
    const [form, setForm] = useState({
        ...initialState,
        email: initialEmail,
    });
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [createdEmail, setCreatedEmail] = useState("");
    const [resendNotice, setResendNotice] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validationErrors = validateSignupForm(form);
    const visibleErrors = getVisibleErrors(validationErrors, touched, submitAttempted);
    function updateField(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
        setError("");
        setSuccess("");
        setResendNotice("");
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
        setSuccess("");
        if (hasValidationErrors(validationErrors)) {
            return;
        }
        setIsSubmitting(true);
        try {
            const body = await requestJson("/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            }, "Unable to create account");
            setCreatedEmail(form.email.trim().toLowerCase());
            setSuccess(getApiMessage(body, "Account created. Please confirm your email."));
            setForm(initialState);
            setTouched({});
            setSubmitAttempted(false);
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to reach the server. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    }
    async function resendConfirmation() {
        if (!createdEmail) {
            return;
        }
        setIsResending(true);
        setError("");
        setResendNotice("");
        try {
            const body = await requestJson("/auth/resend-confirmation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: createdEmail }),
            }, "Unable to resend confirmation email.");
            setResendNotice(getApiMessage(body, "Confirmation email sent."));
        }
        catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : "Unable to resend confirmation email.");
        }
        finally {
            setIsResending(false);
        }
    }
    return (<form onSubmit={handleSubmit} noValidate className="site-border site-card site-elevated rounded-lg border p-4">
      <label className="site-soft block text-xs font-medium">
        Username
        <input type="text" value={form.username} onChange={(event) => updateField("username", event.target.value)} onBlur={() => markTouched("username")} aria-invalid={Boolean(visibleErrors.username)} aria-describedby={visibleErrors.username ? "signup-username-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="yourname" minLength={3} maxLength={50} autoComplete="username" required/>
        <FieldError id="signup-username-error" message={visibleErrors.username}/>
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Email
        <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} onBlur={() => markTouched("email")} aria-invalid={Boolean(visibleErrors.email)} aria-describedby={visibleErrors.email ? "signup-email-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="you@example.com" autoComplete="email" required/>
        <FieldError id="signup-email-error" message={visibleErrors.email}/>
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Password
        <input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} onBlur={() => markTouched("password")} aria-invalid={Boolean(visibleErrors.password)} aria-describedby={visibleErrors.password ? "signup-password-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" placeholder="At least 8 characters" minLength={8} maxLength={50} autoComplete="new-password" required/>
        <FieldError id="signup-password-error" message={visibleErrors.password}/>
      </label>

      <label className="site-soft mt-4 block text-xs font-medium">
        Account type
        <SelectField value={form.role} onChange={(nextValue) => updateField("role", nextValue)} onBlur={() => markTouched("role")} options={accountTypeOptions} className="site-field mt-1.5 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none" ariaInvalid={Boolean(visibleErrors.role)} ariaDescribedBy={visibleErrors.role ? "signup-role-error" : undefined}/>
        <FieldError id="signup-role-error" message={visibleErrors.role}/>
      </label>

      <StatusNotice className="mt-4 text-xs">{error}</StatusNotice>
      <StatusNotice className="mt-4 text-xs" tone="success">{success}</StatusNotice>
      {createdEmail ? (<div className="mt-3">
          <button type="button" onClick={resendConfirmation} disabled={isResending} className="site-border site-field inline-flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold disabled:opacity-70">
            {isResending ? (<LoadingCircle className="h-3.5 w-3.5" label="Sending verification email" />) : null}
            {isResending ? "Sending" : "Resend verification email"}
          </button>
          <StatusNotice className="mt-2 text-xs" tone="success">{resendNotice}</StatusNotice>
        </div>) : null}

      <button type="submit" disabled={isSubmitting} className="site-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed">
        {isSubmitting ? (<LoadingCircle className="h-3.5 w-3.5" label="Creating account" />) : null}
        {isSubmitting ? "Creating account" : "Create Account"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Have an account?{" "}
        <Link href="/login" className="site-accent font-semibold underline-offset-4 hover:underline">
          Login
        </Link>
      </p>
    </form>);
}
