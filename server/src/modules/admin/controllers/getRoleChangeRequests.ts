const userService = require("../../users/users.service");
const defaults = require("../../../config/defaults");
const {
  getHATEOASforAllItems,
  getPagination,
} = require("../../../utils/getPagination");

const getRoleChangeRequests = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Number(req.query.limit) || defaults.limit;
  const sortType = req.query.sort_type || "asc";
  const sortBy = req.query.sort_by || "roleChangeRequest.requestedAt";
  const status = req.query.status || "pending";

  try {
    const data = await userService.getRoleChangeRequests({
      page,
      limit,
      sortType,
      sortBy,
      status,
    });
    const totalItems = await userService.countRoleChangeRequests({ status });
    const pagination = getPagination({ totalItems, limit, page });
    const links = getHATEOASforAllItems({
      url: req.url,
      path: req.path,
      query: req.query,
      hasNext: !!pagination.next,
      hasPrev: !!pagination.prev,
      page,
    });

    res.status(200).json({
      data,
      pagination,
      links,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getRoleChangeRequests;
