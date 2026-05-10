const { User } = require("../../model");
const { badRequest, notFound } = require("../../utils/error");

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
  const user = await User.findById(id);
  return await User.findById(id);
};

const userExitsByEmail = async (email) => {
  const user = await findUserByEmail(email);
  return user ? user : false;
};

const userExitsByUsername = async (username) => {
  const user = await findUserByUsername(username);
  return user ? user : false;
};

const createUser = async ({ username, email, password, role }) => {
  const user = new User({
    username,
    email: normalizeEmail(email),
    password,
    role,
  });
  await user.save();
  return { ...user._doc, id: user.id };
};

const allowedRoles = ["jobseeker", "employer", "admin", "superadmin"];

const getUserFilter = ({ search = "", role = "" }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (allowedRoles.includes(role)) {
    filter.role = role;
  }

  return filter;
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
  }));
};

const count = async ({ search = "", role = "" }) => {
  const filter = getUserFilter({ search, role });

  return User.countDocuments(filter);
};

const getJobseekerFilter = ({ search = "" }) => {
  const filter = {
    role: "jobseeker",
    status: "active",
  };

  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { preferredLocation: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } },
    ];
  }

  return filter;
};

const getJobseekers = async ({ page, limit, sortType, sortBy, search }) => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = getJobseekerFilter({ search });

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

const countJobseekers = async ({ search = "" }) => {
  const filter = getJobseekerFilter({ search });

  return User.countDocuments(filter);
};

const getJobseekerProfile = async (id) => {
  const user = await User.findOne({
    _id: id,
    role: "jobseeker",
    status: "active",
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
  if (companyName !== undefined) user.companyName = companyName;
  if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
  if (companySize !== undefined) user.companySize = companySize;

  await user.save();

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
  return User.findByIdAndDelete(id);
};

module.exports = {
  findUserByEmail,
  userExitsByEmail,
  findUserById,
  userExitsByUsername,
  createUser,
  getAllUser,
  count,
  getJobseekers,
  countJobseekers,
  getJobseekerProfile,
  getSingleUser,
  updateProfile,
  updateUserByAdmin,
  touchLastSeen,
  removeUser,
};
