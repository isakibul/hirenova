const newsletterService = require("../../../../lib/newsletter");
const defaults = require("../../../../config/defaults");
const {
  getTransformedItems,
  getPagination,
  getHATEOASforAllItems,
} = require("../../../../utils/getPagination");

const allowedSortFields = ["createdAt", "email", "status", "subscribedAt"];

const getNewsletterSubscriptions = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Number(req.query.limit) || defaults.limit;
  const sortType = req.query.sort_type || defaults.sortType;
  const requestedSortBy = req.query.sort_by || "createdAt";
  const sortBy = allowedSortFields.includes(requestedSortBy)
    ? requestedSortBy
    : "createdAt";
  const search = req.query.search || "";
  const status = req.query.status || "";

  try {
    const subscriptions = await newsletterService.findAll({
      page,
      limit,
      sortType,
      sortBy,
      search,
      status,
    });

    const data = getTransformedItems({
      items: subscriptions,
      path: "./newsletter",
      selection: [
        "id",
        "email",
        "status",
        "source",
        "subscribedAt",
        "createdAt",
        "updatedAt",
      ],
    });

    const totalItems = await newsletterService.count({ search, status });
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

module.exports = getNewsletterSubscriptions;
