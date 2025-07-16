const userService = require("../../../../lib/user");

const getSingleUser = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  try {
    const user = await userService.getSingleUser(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
