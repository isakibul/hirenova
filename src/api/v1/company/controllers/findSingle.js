const userService = require("../../../../lib/user");

const findSingle = async (req, res, next) => {
  try {
    const company = await userService.getCompanyProfile(req.params.id);

    res.status(200).json({
      data: company,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findSingle;
