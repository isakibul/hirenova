const { User } = require("../../model");
const { notFound } = require("../../utils/error");

const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
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
  const user = new User({ username, email, password, role });
  await user.save();
  return { ...user._doc, id: user.id };
};

const getAllUser = async ({ page, limit, sortType, sortBy, search }) => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(filter)
    .sort(sortStr)
    .skip((page - 1) * limit)
    .limit(limit);

  return users.map((user) => ({
    ...user._doc,
    id: user.id,
  }));
};

const count = async ({ search = "" }) => {
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  return User.countDocuments(filter);
};

const getSingleUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw notFound("User not found");
  }
  return { ...user._doc, id: user._id.toString() };
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
  getSingleUser,
  removeUser,
};
