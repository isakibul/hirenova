const { User } = require("../../../infrastructure/database/models");
const { authorizationError, badRequest } = require("../../../utils/error");

const safeUserPart = (userId) => String(userId).replace(/[^a-zA-Z0-9_-]/g, "-");

const getResumeFilename = (resumeUrl = "") => {
  const rawUrl = String(resumeUrl ?? "").trim();

  if (!rawUrl) {
    return "";
  }

  let pathname = rawUrl;

  try {
    pathname = new URL(rawUrl).pathname;
  } catch {
    // Relative API paths are allowed.
  }

  const normalizedPathname = decodeURIComponent(pathname);

  if (!normalizedPathname.startsWith("/api/v1/auth/resumes/")) {
    return "";
  }

  return normalizedPathname.split("/").pop();
};

const getResumeUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/api/v1/auth/resumes/${encodeURIComponent(filename)}`;

const validateOwnResumeUrl = (userId, resumeUrl = "") => {
  if (!resumeUrl) {
    return;
  }

  const filename = getResumeFilename(resumeUrl);

  if (!filename || !filename.startsWith(`${safeUserPart(userId)}-`)) {
    throw badRequest("Invalid resume URL.");
  }
};

const canAccessResume = async ({ filename, user }) => {
  if (filename.startsWith(`${safeUserPart(user.id)}-`)) {
    return true;
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    return false;
  }

  const owner = await User.findOne({
    resumeUrl: { $regex: `/api/v1/auth/resumes/${escapeRegExp(filename)}$` },
  }).select("_id");

  return Boolean(owner);
};

const assertCanAccessResume = async ({ filename, user }) => {
  if (await canAccessResume({ filename, user })) {
    return;
  }

  throw authorizationError("Operation not allowed");
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  assertCanAccessResume,
  getResumeFilename,
  getResumeUrl,
  safeUserPart,
  validateOwnResumeUrl,
};
