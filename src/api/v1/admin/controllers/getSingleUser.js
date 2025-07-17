const userService = require("../../../../lib/user");
const { notFound } = require("../../../../utils/error");

const getSingleUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await userService.getSingleUser(id);

    if (!user) {
      throw notFound("User not found");
    }

    const { _id, password, __v, ...rest } = user;
    const sanitizedUser = {
      id: _id.toString(),
      ...rest,
    };

    res.status(200).json({
      data: sanitizedUser,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getSingleUser;
