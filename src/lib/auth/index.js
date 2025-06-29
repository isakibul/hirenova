const { badRequest } = require("../../utils/error");
const {
  createUser,
  userExitsByEmail,
  userExitsByUsername,
} = require("../user");
const { generateHash, hashMatched } = require("../../utils/hashing");
const { generateToken } = require("../token/");

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

const login = async ({ email, password }) => {
  const user = await userExitsByEmail(email);

  if (!user) {
    throw badRequest("Invalid credentials");
  }

  const matched = await hashMatched(password, user.password);
  if (!matched) {
    throw badRequest("Invalid credentials");
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return generateToken({ payload });
};

module.exports = {
  register,
  login,
};
