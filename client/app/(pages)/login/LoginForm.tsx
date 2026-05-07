"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginState = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginState>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error ?? "Unable to login");
        return;
      }

      router.push("/jobs");
      router.refresh();
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
          placeholder="Enter your password"
          required
        />
      </label>

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
