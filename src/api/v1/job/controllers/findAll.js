const jobService = require("../../../../lib/job");
const defaults = require("../../../../config/defaults");
const {
  getTransformedItems,
  getPagination,
  getHATEOASforAllItems,
} = require("../../../../utils/getPagination");

const findAll = async (req, res, next) => {
  console.log("In findAll");

  const page = Number(req.query.page) || defaults.page;
  const limit = Number(req.query.limit) || defaults.limit;
  const sortType = req.query.sort_type || defaults.sortType;
  const sortBy = req.query.sort_by || defaults.sortBy;
  const search = req.query.search || "";

  try {
    const jobs = await jobService.findAll({
      page,
      limit,
      sortType,
      sortBy,
      search,
    });

    const data = getTransformedItems({
      items: jobs,
      path: "./job",
      selection: ["id", "title", "updatedAt", "createdAt"],
    });

    const totalItems = await jobService.count({ search });
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

module.exports = findAll;
