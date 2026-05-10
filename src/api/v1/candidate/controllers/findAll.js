const defaults = require("../../../../config/defaults");
const userService = require("../../../../lib/user");
const {
  getHATEOASforAllItems,
  getPagination,
  getTransformedItems,
} = require("../../../../utils/getPagination");

const allowedSortFields = ["createdAt", "updatedAt", "username", "experience"];

const findAll = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Number(req.query.limit) || defaults.limit;
  const sortType = req.query.sort_type || defaults.sortType;
  const requestedSortBy = req.query.sort_by || defaults.sortBy;
  const sortBy = allowedSortFields.includes(requestedSortBy)
    ? requestedSortBy
    : "updatedAt";
  const search = req.query.search || "";

  try {
    const users = await userService.getJobseekers({
      page,
      limit,
      sortType,
      sortBy,
      search,
    });
    const totalItems = await userService.countJobseekers({ search });
    const pagination = getPagination({ totalItems, limit, page });
    const data = getTransformedItems({
      items: users,
      path: "./candidate",
      selection: [
        "id",
        "username",
        "email",
        "role",
        "status",
        "skills",
        "resumeUrl",
        "experience",
        "preferredLocation",
        "createdAt",
        "updatedAt",
      ],
    });
    const links = getHATEOASforAllItems({
      url: req.url,
      path: req.path,
      query: req.query,
      hasNext: !!pagination.next,
      hasPrev: !!pagination.prev,
      page,
    });

    res.status(200).json({ data, pagination, links });
  } catch (e) {
    next(e);
  }
};

module.exports = findAll;
