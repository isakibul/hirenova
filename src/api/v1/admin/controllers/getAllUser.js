const userService = require("../../../../lib/user");
const defaults = require("../../../../config/defaults");
const {
  getTransformedItems,
  getPagination,
  getHATEOASforAllItems,
} = require("../../../../utils/getPagination");

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

    const data = getTransformedItems({
      items: user,
      path: "./user",
      selection: ["id", "name", "email", "createdAt"],
    });

    const totalItems = await userService.count({ search });

    const pagination = getPagination({ totalItems, limit, page });

    const links = getHATEOASforAllItems({
      url: req.url,
      path: req.path,
      query: req.query,
      hasNext: !!pagination.next,
      hasPrev: !!pagination.prev,
      page,
    });

    const response = {
      data,
      pagination,
      links,
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = getAllUser;
