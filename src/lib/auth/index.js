const { badRequest } = require("../../utils/error");
const {
  createUser,
  userExitsByEmail,
  userExitsByUsername,
} = require("../user");
const { generateHash } = require("../../utils/hashing");

const register = async ({ username, email, password, role }) => {
  const hasUserByEmail = await userExitsByEmail(email);
  const hasUserByUsername = await userExitsByUsername(username);

  if (hasUserByEmail || hasUserByUsername) {
    throw badRequest("User already exists");
  }

  password = await generateHash(password);

  const user = await createUser({ username, email, password, role });

  return user;
};

module.exports = {
  register,
};
