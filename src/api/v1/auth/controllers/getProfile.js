const { findUserById } = require("../../../../lib/user");
const { notFound } = require("../../../../utils/error");

function sanitizeUser(user) {
  const { _id, password, __v, ...rest } = user._doc ?? user;

  return {
    id: (_id ?? user.id).toString(),
    ...rest,
  };
}

const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      throw notFound("User not found");
    }

    res.status(200).json({
      data: sanitizeUser(user),
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getProfile;
