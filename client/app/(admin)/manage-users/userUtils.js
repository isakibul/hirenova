import {
  emailError,
  passwordError,
  usernameError,
} from "@lib/formValidation";

export const emptyForm = {
  username: "",
  email: "",
  password: "",
  role: "jobseeker",
};

export const roles = [
  { value: "jobseeker", label: "Job Seeker" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
];

export const roleTabs = [
  { value: "all", label: "All" },
  { value: "jobseeker", label: "Job Seeker" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
];

export const adminManagedRoles = roles.filter((role) =>
  ["jobseeker", "employer"].includes(role.value),
);

export const userSortOptions = [
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "username", label: "Username" },
  { value: "email", label: "Email" },
  { value: "role", label: "Role" },
];

export function formatRole(value) {
  return roles.find((role) => role.value === value)?.label ?? "Not set";
}

export function isAdminLevelRole(role) {
  return role === "admin" || role === "superadmin";
}

export function buildPayload(form) {
  return {
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    role: form.role,
  };
}

export function validateUserForm(form, roleOptions = roles) {
  return {
    username: usernameError(form.username),
    email: emailError(form.email),
    password: passwordError(form.password),
    role: roleOptions.some((role) => role.value === form.role)
      ? ""
      : "Choose a valid role.",
  };
}
