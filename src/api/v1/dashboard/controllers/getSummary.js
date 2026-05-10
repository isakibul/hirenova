const dashboardService = require("../../../../lib/dashboard");

const getSummary = async (req, res, next) => {
  try {
    const role = req.user.role;
    const data =
      role === "admin" || role === "superadmin"
        ? await dashboardService.getAdminSummary()
        : role === "employer"
        ? await dashboardService.getEmployerSummary(req.user.id)
        : await dashboardService.getJobseekerSummary(req.user.id);

    res.status(200).json({
      data: {
        role,
        ...data,
      },
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getSummary;
