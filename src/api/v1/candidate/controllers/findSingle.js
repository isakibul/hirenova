const userService = require("../../../../lib/user");

const findSingle = async (req, res, next) => {
  try {
    const user = await userService.getJobseekerProfile(req.params.id);

    res.status(200).json({
      data: user,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findSingle;
