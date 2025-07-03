const { badRequest } = require("../../utils/error");
const {
  createUser,
  userExitsByEmail,
  userExitsByUsername,
} = require("../user");
const { generateHash, hashMatched } = require("../../utils/hashing");
const { generateToken } = require("../token/");

const register = async ({ model, username, email, password }) => {
  const hasUserByEmail = await userExitsByEmail(model, email);
  const hasUserByUsername = await userExitsByUsername(model, username);

  if (hasUserByEmail || hasUserByUsername) {
    throw badRequest("User already exists");
  }

  const hashedPassword = await generateHash(password);

  const user = await createUser({
    model,
    username,
    email,
    password: hashedPassword,
  });

  return user;
};

const login = async ({ model, email, password }) => {
  const user = await userExitsByEmail(model, email);

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
