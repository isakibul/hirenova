const { badRequest } = require("../../utils/error");
const {
  createUser,
  userExistsByEmail,
  userExistsByUsername,
} = require("../user");
const newsletterService = require("../newsletter");
const { generateHash, hashMatched } = require("../../utils/hashing");
const { generateToken } = require("../token/");

const subscribeAuthEmail = async (email, source) => {
  try {
    await newsletterService.subscribe({
      email,
      source,
    });
  } catch (error) {
    console.error("Unable to save newsletter subscription:", error.message);
  }
};

const register = async ({ username, email, password, role, status }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const hasUserByEmail = await userExistsByEmail(normalizedEmail);
  const hasUserByUsername = await userExistsByUsername(username);

  if (hasUserByEmail || hasUserByUsername) {
    throw badRequest("User already exists");
  }

  const hashedPassword = await generateHash(password);

  const user = await createUser({
    username,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    status,
  });

  await subscribeAuthEmail(user.email, "auth-signup");

  return user;
};

const login = async ({ email, password }) => {
  const user = await userExistsByEmail(email.trim().toLowerCase());

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

  await subscribeAuthEmail(user.email, "auth-login");

  return generateToken({ payload });
};

module.exports = {
  register,
  login,
};
