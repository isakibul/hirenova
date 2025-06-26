const User = require("../../model/User");

const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user ? user : false;
};

const findUserByUsername = async (username) => {
  const user = await User.findOne({ username });
  return user ? user : false;
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

module.exports = {
  findUserByEmail,
  userExitsByEmail,
  userExitsByUsername,
  createUser,
};
