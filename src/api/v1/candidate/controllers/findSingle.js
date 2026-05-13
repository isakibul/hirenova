const userService = require("../../../../lib/user");

const findSingle = async (req, res, next) => {
  try {
    const statuses =
      req.user?.role === "admin" || req.user?.role === "superadmin"
        ? ["active", "pending"]
        : ["active"];
    const user = await userService.getJobseekerProfile(req.params.id, {
      statuses,
    });

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
