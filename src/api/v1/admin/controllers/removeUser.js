const userService = require("../../../../lib/user");

const removeUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    await userService.removeUser(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

module.exports = removeUser;
