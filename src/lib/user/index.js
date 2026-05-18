const { Job, Notification, User } = require("../../model");
const { badRequest, notFound } = require("../../utils/error");
const notificationService = require("../notification");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({
    email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, "i"),
  });
  return user ? user : false;
};

const findUserByUsername = async (username) => {
  const user = await User.findOne({ username });
  return user ? user : false;
};

const findUserById = async (id) => {
  return await User.findById(id);
};

const userExistsByEmail = async (email) => {
  const user = await findUserByEmail(email);
  return user ? user : false;
};

const userExistsByUsername = async (username) => {
  const user = await findUserByUsername(username);
  return user ? user : false;
};

const createUser = async ({ username, email, password, role, status }) => {
  const user = new User({
    username,
    email: normalizeEmail(email),
    password,
    role,
    status,
  });
  await user.save();
  return { ...user._doc, id: user.id };
};

const allowedRoles = ["jobseeker", "employer", "admin", "superadmin"];

const getUserFilter = ({ search = "", role = "" }) => {
  const filter = {};

  if (search) {
    const safeSearch = escapeRegExp(search.trim());
    filter.$or = [
      { username: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (allowedRoles.includes(role)) {
    filter.role = role;
  }

  return filter;
};

const sanitizeRoleChangeRequest = (request = {}) => {
  if (!request?.status) {
    return undefined;
  }

  return {
    requestedRole: request.requestedRole,
    status: request.status,
    requestedAt: request.requestedAt,
    reviewedAt: request.reviewedAt,
    reviewedBy: request.reviewedBy?.toString?.() ?? request.reviewedBy,
    note: request.note,
  };
};

const notifyAdminsForRoleChangeRequest = async (user) => {
  const admins = await User.find({
    role: { $in: ["admin", "superadmin"] },
    status: { $ne: "suspended" },
  }).select("_id");

  const requestUserId = user.id ?? user._id?.toString();
  const requestedAt = user.roleChangeRequest?.requestedAt
    ? new Date(user.roleChangeRequest.requestedAt).toISOString()
    : "";
  const notifications = [];

  for (const admin of admins) {
    const existing = await Notification.findOne({
      recipient: admin._id,
      type: "role_change_requested",
      "metadata.user": requestUserId,
      "metadata.requestedRole": "employer",
      "metadata.requestedAt": requestedAt,
    });

    if (existing) {
      if (existing.readAt) {
        existing.readAt = null;
        await existing.save();
      }
    } else {
      notifications.push({
      recipient: admin._id,
      type: "role_change_requested",
      title: "Employer access requested",
      message: `${user.username ?? user.email} requested employer access.`,
      link: "/manage-users",
      metadata: {
        user: requestUserId,
        requestedRole: "employer",
        requestedAt,
      },
      });
    }
  }

  await notificationService.createManyNotifications(notifications);
};

const notifyUserForRoleChangeReview = async ({ user, decision }) => {
  await notificationService.createNotification({
    recipient: user._id,
    type:
      decision === "approved"
        ? "role_change_approved"
        : "role_change_declined",
    title:
      decision === "approved"
        ? "Employer access approved"
        : "Employer access declined",
    message:
      decision === "approved"
        ? "Your employer access request was approved. You can now complete your hiring profile."
        : "Your employer access request was declined. You can update your note and request again.",
    link: "/profile",
    metadata: {
      requestedRole: "employer",
      decision,
    },
  });
};

const getAllUser = async ({ page, limit, sortType, sortBy, search, role }) => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = getUserFilter({ search, role });

  const users = await User.find(filter)
    .sort(sortStr)
    .skip((page - 1) * limit)
    .limit(limit);

  return users.map((user) => ({
    ...user._doc,
    id: user.id,
    roleChangeRequest: sanitizeRoleChangeRequest(user.roleChangeRequest),
  }));
};

const count = async ({ search = "", role = "" }) => {
  const filter = getUserFilter({ search, role });

  return User.countDocuments(filter);
};

const getJobseekerFilter = ({ search = "", statuses = ["active"] }) => {
  const allowedStatuses = ["pending", "active", "suspended"];
  const nextStatuses = Array.isArray(statuses)
    ? statuses.filter((status) => allowedStatuses.includes(status))
    : [];
  const filter = {
    role: "jobseeker",
    status: { $in: nextStatuses.length ? nextStatuses : ["active"] },
  };

  if (search) {
    const safeSearch = escapeRegExp(search.trim());
    filter.$or = [
      { username: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { preferredLocation: { $regex: safeSearch, $options: "i" } },
      { skills: { $regex: safeSearch, $options: "i" } },
    ];
  }

  return filter;
};

const getJobseekers = async ({ page, limit, sortType, sortBy, search, statuses }) => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = getJobseekerFilter({ search, statuses });

  const users = await User.find(filter)
    .select(
      "username email role status skills resumeUrl experience preferredLocation createdAt updatedAt"
    )
    .sort(sortStr)
    .skip((page - 1) * limit)
    .limit(limit);

  return users.map((user) => ({
    ...user._doc,
    id: user.id,
  }));
};

const countJobseekers = async ({ search = "", statuses }) => {
  const filter = getJobseekerFilter({ search, statuses });

  return User.countDocuments(filter);
};

const getJobseekerProfile = async (id, { statuses = ["active"] } = {}) => {
  const filter = getJobseekerFilter({ statuses });
  const user = await User.findOne({
    _id: id,
    role: filter.role,
    status: filter.status,
  }).select(
    "username email role status skills resumeUrl experience preferredLocation createdAt updatedAt"
  );

  if (!user) {
    throw notFound("Job seeker not found");
  }

  return { ...user._doc, id: user._id.toString() };
};

const getSingleUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw notFound("User not found");
  }
  return { ...user._doc, id: user._id.toString() };
};

const getCompanyProfile = async (id) => {
  const user = await User.findById(id).select(
    "username email role status companyName companyWebsite companySize companyAbout createdAt updatedAt"
  );

  if (!user || !["employer", "admin", "superadmin"].includes(user.role)) {
    throw notFound("Company not found");
  }

  const jobs = await Job.find({
    author: user._id,
    status: "open",
    approvalStatus: "approved",
  })
    .select(
      "title location jobType salary experienceRequired experienceMin experienceMax skillsRequired expiresAt createdAt"
    )
    .sort("-createdAt")
    .limit(6)
    .lean();

  return {
    id: user._id.toString(),
    name: user.companyName || user.username || "Company",
    username: user.username,
    website: user.companyWebsite || "",
    size: user.companySize || "",
    about: user.companyAbout || "",
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    jobs: jobs.map((job) => ({
      ...job,
      id: job._id.toString(),
    })),
  };
};

const updateProfile = async (
  id,
  {
    username,
    email,
    skills,
    resumeUrl,
    experience,
    preferredLocation,
    companyName,
    companyWebsite,
    companySize,
    companyAbout,
  }
) => {
  const user = await User.findById(id);

  if (!user) {
    throw notFound("User not found");
  }

  if (username && username !== user.username) {
    const existingUser = await User.findOne({
      username,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw badRequest("Username is already in use");
    }

    user.username = username;
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw badRequest("Email is already in use");
    }

    user.email = email;
  }

  if (Array.isArray(skills)) user.skills = skills;
  if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
  if (experience !== undefined) user.experience = experience;
  if (preferredLocation !== undefined) user.preferredLocation = preferredLocation;
  if (user.role !== "jobseeker") {
    if (companyName !== undefined) user.companyName = companyName;
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
    if (companySize !== undefined) user.companySize = companySize;
    if (companyAbout !== undefined) user.companyAbout = companyAbout;
  }

  await user.save();

  return { ...user._doc, id: user._id.toString() };
};

const requestEmployerRoleChange = async (id, note = "") => {
  const user = await User.findById(id);

  if (!user) {
    throw notFound("User not found");
  }

  if (user.role !== "jobseeker") {
    throw badRequest("Only job seekers can request employer access.");
  }

  if (user.status !== "active") {
    throw badRequest("Your account must be active before requesting employer access.");
  }

  if (user.roleChangeRequest?.status === "pending") {
    user.roleChangeRequest.note = note;
    await user.save();
    await notifyAdminsForRoleChangeRequest(user);
    return { ...user._doc, id: user._id.toString() };
  }

  user.roleChangeRequest = {
    requestedRole: "employer",
    status: "pending",
    requestedAt: new Date(),
    note,
  };

  await user.save();
  await notifyAdminsForRoleChangeRequest(user);
  return { ...user._doc, id: user._id.toString() };
};

const getRoleChangeRequestFilter = ({ status = "pending" } = {}) => {
  const allowedStatuses = ["pending", "approved", "declined"];
  const filter = {
    "roleChangeRequest.status": allowedStatuses.includes(status)
      ? status
      : "pending",
  };

  return filter;
};

const getRoleChangeRequests = async ({
  page,
  limit,
  sortType,
  sortBy,
  status,
}) => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = getRoleChangeRequestFilter({ status });

  const users = await User.find(filter)
    .select("username email role status roleChangeRequest createdAt updatedAt")
    .sort(sortStr)
    .skip((page - 1) * limit)
    .limit(limit);

  if (filter["roleChangeRequest.status"] === "pending") {
    await Promise.all(users.map((user) => notifyAdminsForRoleChangeRequest(user)));
  }

  return users.map((user) => ({
    ...user._doc,
    id: user._id.toString(),
    roleChangeRequest: sanitizeRoleChangeRequest(user.roleChangeRequest),
  }));
};

const countRoleChangeRequests = async ({ status = "pending" } = {}) => {
  return User.countDocuments(getRoleChangeRequestFilter({ status }));
};

const reviewRoleChangeRequest = async ({ id, reviewerId, decision }) => {
  const user = await User.findById(id);

  if (!user) {
    throw notFound("User not found");
  }

  if (user.roleChangeRequest?.status !== "pending") {
    throw badRequest("This role change request is no longer pending.");
  }

  const reviewedAt = new Date();

  user.roleChangeRequest.status = decision;
  user.roleChangeRequest.reviewedAt = reviewedAt;
  user.roleChangeRequest.reviewedBy = reviewerId;

  if (decision === "approved") {
    user.role = user.roleChangeRequest.requestedRole;
  }

  await user.save();
  await notifyUserForRoleChangeReview({ user, decision });
  return { ...user._doc, id: user._id.toString() };
};

const updateUserByAdmin = async (id, payload) => {
  const user = await updateProfile(id, payload);
  const target = await User.findById(user.id);

  if (payload.role) target.role = payload.role;
  if (payload.status) target.status = payload.status;

  await target.save();
  return { ...target._doc, id: target._id.toString() };
};

const touchLastSeen = async (id) => {
  await User.findByIdAndUpdate(id, { lastSeenAt: new Date() });
};

const removeUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw notFound("User not found");
  }
  return { ...user._doc, id: user._id.toString() };
};

module.exports = {
  findUserByEmail,
  userExistsByEmail,
  findUserById,
  userExistsByUsername,
  createUser,
  getAllUser,
  count,
  getJobseekers,
  countJobseekers,
  getJobseekerProfile,
  getSingleUser,
  getCompanyProfile,
  updateProfile,
  updateUserByAdmin,
  requestEmployerRoleChange,
  getRoleChangeRequests,
  countRoleChangeRequests,
  reviewRoleChangeRequest,
  touchLastSeen,
  removeUser,
};
