"use client";
import FieldError from "@components/forms/FieldError";
import { emailError, getVisibleErrors, hasValidationErrors, passwordError, touchAll, usernameError, } from "@lib/formValidation";
import Link from "next/link";
import { useState } from "react";
const initialState = {
    username: "",
    email: "",
    password: "",
    role: "jobseeker",
};
function getMessage(body, fallback) {
    return body.error ?? body.message ?? fallback;
}
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
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });
            const body = (await response.json());
            if (!response.ok) {
                setError(getMessage(body, "Unable to create account"));
                return;
            }
            setSuccess(getMessage(body, "Account created. Please confirm your email."));
            setForm(initialState);
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
        <select value={form.role} onChange={(event) => updateField("role", event.target.value)} onBlur={() => markTouched("role")} aria-invalid={Boolean(visibleErrors.role)} aria-describedby={visibleErrors.role ? "signup-role-error" : undefined} className="site-field mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none">
          <option value="jobseeker">Job seeker</option>
          <option value="employer">Employer</option>
        </select>
        <FieldError id="signup-role-error" message={visibleErrors.role}/>
      </label>

      {error ? (<p className="site-danger mt-4 rounded-md border px-3 py-2 text-xs">
          {error}
        </p>) : null}

      {success ? (<p className="site-success mt-4 rounded-md border px-3 py-2 text-xs">
          {success}
        </p>) : null}

      <button type="submit" disabled={isSubmitting} className="site-button mt-5 w-full rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed">
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="site-muted mt-4 text-center text-xs">
        Have an account?{" "}
        <Link href="/login" className="site-accent font-semibold underline-offset-4 hover:underline">
          Login
        </Link>
      </p>
    </form>);
}
