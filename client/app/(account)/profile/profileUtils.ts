import {
  emailError,
  passwordError,
  usernameError,
} from "@lib/formValidation";

const roleLabels = {
  jobseeker: "Job Seeker",
  employer: "Employer",
  admin: "Admin",
  superadmin: "Super Admin",
};

const statusLabels = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
};

export const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const defaultParsedFieldSelection = {
  email: false,
  skills: true,
  experience: true,
  preferredLocation: true,
};

export function formatRole(value) {
  return value ? roleLabels[value] : "Member";
}

export function formatStatus(value) {
  return value ? statusLabels[value] : "Not set";
}

export function validateProfileForm(form) {
  return {
    username: usernameError(form.username),
    email: emailError(form.email),
  };
}

export function getRoleSummary(role) {
  if (role === "admin" || role === "superadmin") {
    return "Your admin access is separate from your career and hiring profile details.";
  }

  if (role === "employer") {
    return "You can keep company hiring details and still maintain candidate information.";
  }

  return "You can keep candidate details here and request employer access when you are ready to hire.";
}

export function getProfileForm(data = {}) {
  return {
    username: data.username ?? "",
    email: data.email ?? "",
    skills: data.skills?.join(", ") ?? "",
    resumeUrl: data.resumeUrl ?? "",
    experience: typeof data.experience === "number" ? String(data.experience) : "",
    preferredLocation: data.preferredLocation ?? "",
    companyName: data.companyName ?? "",
    companyWebsite: data.companyWebsite ?? "",
    companySize: data.companySize ?? "",
    companyAbout: data.companyAbout ?? "",
  };
}

export function buildProfilePayload(form, resumeUrl = form.resumeUrl, role = "jobseeker") {
  const payload = {
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    skills: form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    resumeUrl: resumeUrl.trim(),
    experience: form.experience === "" ? undefined : Number(form.experience),
    preferredLocation: form.preferredLocation.trim(),
  };

  if (role !== "jobseeker") {
    payload.companyName = form.companyName.trim();
    payload.companyWebsite = form.companyWebsite.trim();
    payload.companySize = form.companySize.trim();
    payload.companyAbout = form.companyAbout.trim();
  }

  return payload;
}

export function mergeCommaList(currentValue, nextItems = []) {
  const values = [
    ...String(currentValue ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    ...nextItems.map((item) => String(item).trim()).filter(Boolean),
  ];

  return Array.from(new Set(values.map((item) => item.toLowerCase())))
    .map((key) => values.find((item) => item.toLowerCase() === key))
    .filter(Boolean)
    .join(", ");
}

export function getParsedFieldRows(parsedResume, profileForm) {
  if (!parsedResume) {
    return [];
  }

  return [
    {
      key: "email",
      label: "Email",
      current: profileForm.email || "Not set",
      parsed: parsedResume.email || "",
    },
    {
      key: "skills",
      label: "Skills",
      current: profileForm.skills || "Not set",
      parsed: parsedResume.skills?.length ? parsedResume.skills.join(", ") : "",
    },
    {
      key: "experience",
      label: "Experience",
      current: profileForm.experience ? `${profileForm.experience} years` : "Not set",
      parsed:
        typeof parsedResume.experienceYears === "number"
          ? `${parsedResume.experienceYears} years`
          : "",
    },
    {
      key: "preferredLocation",
      label: "Preferred Location",
      current: profileForm.preferredLocation || "Not set",
      parsed: parsedResume.location || "",
    },
  ].filter((row) => row.parsed);
}

export function getParsedFieldSelection(parsedResume) {
  const rows = getParsedFieldRows(parsedResume, {});

  return rows.reduce(
    (selection, row) => ({
      ...selection,
      [row.key]: defaultParsedFieldSelection[row.key],
    }),
    {},
  );
}

export function validatePasswordForm(form) {
  return {
    currentPassword: form.currentPassword ? "" : "Current password is required.",
    newPassword: passwordError(form.newPassword, "New password"),
    confirmPassword: form.confirmPassword
      ? form.newPassword === form.confirmPassword
        ? ""
        : "Passwords do not match."
      : "Confirm password is required.",
  };
}
