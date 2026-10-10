"use client";

import { useState } from "react";
import Icon from "@components/Icon";

export default function PasswordField({
  className = "",
  containerClassName = "",
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="site-muted absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition hover:text-[var(--site-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--site-accent)]"
        aria-label={isVisible ? hideLabel : showLabel}
        aria-pressed={isVisible}
      >
        <Icon name={isVisible ? "eyeOff" : "eye"} />
      </button>
    </div>
  );
}
