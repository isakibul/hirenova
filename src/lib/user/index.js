const findUserByEmail = async (model, email) => {
  const user = await model.findOne({ email });
  return user ? user : false;
};

const findUserByUsername = async (model, username) => {
  const user = await model.findOne({ username });
  return user ? user : false;
};

const userExitsByEmail = async (model, email) => {
  const user = await findUserByEmail(model, email);
  return user ? user : false;
};

const userExitsByUsername = async (model, username) => {
  const user = await findUserByUsername(model, username);
  return user ? user : false;
};

const createUser = async ({ model, username, email, password, role }) => {
  const user = new model({ username, email, password, role });
  await user.save();
  return { ...user._doc, id: user.id };
};

module.exports = {
  findUserByEmail,
  userExitsByEmail,
  userExitsByUsername,
  createUser,
};
