const { badRequest } = require("../../utils/error");
const {
  createUser,
  userExitsByEmail,
  userExitsByUsername,
} = require("../user");
const newsletterService = require("../newsletter");
const { generateHash, hashMatched } = require("../../utils/hashing");
const { generateToken } = require("../token/");

const register = async ({ username, email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const hasUserByEmail = await userExitsByEmail(normalizedEmail);
  const hasUserByUsername = await userExitsByUsername(username);

  if (hasUserByEmail || hasUserByUsername) {
    throw badRequest("User already exists");
  }

  const hashedPassword = await generateHash(password);

  const user = await createUser({
    username,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });

  return user;
};

const login = async ({ email, password }) => {
  const user = await userExitsByEmail(email.trim().toLowerCase());

  if (!user) {
    throw badRequest("Invalid credentials");
  }

  if (user.status !== "active") {
    throw badRequest(`Your account is ${user.status}`);
  }

  const matched = await hashMatched(password, user.password);
  if (!matched) {
    throw badRequest("Invalid credentials");
  }

  const payload = {
    id: user.id,
    name: user.username,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  await newsletterService.subscribe({
    email: user.email,
    source: "auth-login",
  });

  return generateToken({ payload });
};

module.exports = {
  register,
  login,
};
