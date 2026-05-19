const path = require("path");

const { User } = require("../../../../model");
const { authorizationError, badRequest, notFound } = require("../../../../utils/error");

const uploadRoot = path.join(process.cwd(), "uploads", "resumes");

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

  return path.basename(normalizedPathname);
};

const getResumeUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/api/v1/auth/resumes/${encodeURIComponent(filename)}`;

const getResumePath = (filename) => {
  const safeFilename = path.basename(filename);
  const filepath = path.resolve(uploadRoot, safeFilename);

  if (!filepath.startsWith(uploadRoot)) {
    throw badRequest("Invalid resume path.");
  }

  return filepath;
};

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

const assertResumeExists = async (filepath) => {
  const { stat } = require("fs/promises");

  try {
    await stat(filepath);
  } catch {
    throw notFound("Resume not found");
  }
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  assertCanAccessResume,
  assertResumeExists,
  getResumeFilename,
  getResumePath,
  getResumeUrl,
  safeUserPart,
  uploadRoot,
  validateOwnResumeUrl,
};
