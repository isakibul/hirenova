const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export function isBlank(value) {
  return String(value ?? "").trim() === "";
}

export function required(value, label) {
  return isBlank(value) ? `${label} is required.` : "";
}

export function usernameError(value) {
  const username = String(value ?? "").trim();

  if (!username) {
    return "Username is required.";
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters.";
  }

  if (username.length > 50) {
    return "Username must be 50 characters or less.";
  }

  return "";
}

export function emailError(value) {
  const email = String(value ?? "").trim();

  if (!email) {
    return "Email is required.";
  }

  if (!emailPattern.test(email)) {
    return "Enter a valid email address.";
  }

  return "";
}

export function passwordError(value, label = "Password") {
  const password = String(value ?? "");

  if (!password) {
    return `${label} is required.`;
  }

  if (password.length < 8) {
    return `${label} must be at least 8 characters.`;
  }

  if (password.length > 50) {
    return `${label} must be 50 characters or less.`;
  }

  if (!passwordPattern.test(password)) {
    return `${label} must include uppercase, lowercase, and a number.`;
  }

  return "";
}

export function optionalNumberError(value, label, { min } = {}) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return "";
  }

  const number = Number(rawValue);

  if (!Number.isFinite(number)) {
    return `${label} must be a valid number.`;
  }

  if (typeof min === "number" && number < min) {
    return `${label} must be at least ${min}.`;
  }

  return "";
}

export function minLengthError(value, label, min) {
  const text = String(value ?? "").trim();

  if (!text) {
    return `${label} is required.`;
  }

  if (text.length < min) {
    return `${label} must be at least ${min} characters.`;
  }

  return "";
}

export function maxLengthError(value, label, max) {
  return String(value ?? "").length > max
    ? `${label} must be ${max} characters or less.`
    : "";
}

export function hasValidationErrors(errors) {
  return Object.values(errors).some(Boolean);
}

export function touchAll(errors) {
  return Object.fromEntries(Object.keys(errors).map((field) => [field, true]));
}

export function getVisibleErrors(errors, touched, submitAttempted) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => [
      field,
      touched[field] || submitAttempted ? message : "",
    ]),
  );
}
