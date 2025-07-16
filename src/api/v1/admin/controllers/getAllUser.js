const userService = require("../../../../lib/user");
const defaults = require("../../../../config/defaults");

const getAllUser = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Number(req.query.limit) || defaults.limit;
  const sortType = req.query.sort_type || defaults.sortType;
  const sortBy = req.query.sort_by || defaults.sortBy;
  const search = req.query.search || "";

  try {
    const user = await userService.getAllUser({
      page,
      limit,
      sortType,
      sortBy,
      search,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getAllUser;
