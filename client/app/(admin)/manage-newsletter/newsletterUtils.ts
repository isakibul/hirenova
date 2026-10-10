export const sortOptions = [
  { value: "createdAt", label: "Newest Added" },
  { value: "email", label: "Email" },
  { value: "status", label: "Status" },
  { value: "subscribedAt", label: "Subscribed Date" },
];

export const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "subscribed", label: "Subscribed" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

export const emptyCampaignForm = {
  subject: "",
  previewText: "",
  body: "",
};

export function formatStatus(value) {
  return value === "unsubscribed" ? "Unsubscribed" : "Subscribed";
}

export function formatSource(value) {
  if (value === "footer") return "Manual subscription";
  if (value === "home") return "Homepage";
  if (value === "auth-signup") return "Account signup";
  if (value === "auth-login") return "Account activity";
  return value || "Manual subscription";
}

export function getCampaignStatusClass(status) {
  if (status === "sent") return "site-success";
  if (status === "failed") return "site-danger";
  return "site-border site-panel";
}

export function getCampaignStatusLabel(status) {
  if (status === "partial") return "Partial";
  if (status === "failed") return "Failed";
  return "Sent";
}
