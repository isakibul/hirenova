"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function getSignupPath(email) {
  const trimmed = email.trim();

  return trimmed ? `/signup?email=${encodeURIComponent(trimmed)}` : "/signup";
}

export default function HomeSignupForm() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();
    router.push(getSignupPath(email));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="site-border site-card mx-auto mt-8 grid max-w-xl gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_auto]"
    >
      <label className="sr-only" htmlFor="home-email">
        Email address
      </label>
      <input
        id="home-email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        type="email"
        className="site-field h-11 rounded-md border px-3 text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="site-button h-11 rounded-md px-4 text-sm font-semibold transition"
      >
        Get Started
      </button>
    </form>
  );
}
