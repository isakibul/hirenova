const jobService = require("../../../../lib/job");
const defaults = require("../../../../config/defaults");

const findAll = async (req, res, next) => {
  const page = req.query.page || defaults.page;
  const limit = req.query.limit || defaults.limit;
  const sortType = req.query.sort_type || defaults.sortType;
  const sortBy = req.query.sort_by || defaults.sortBy;
  const search = req.query.search || "";

  const jobs = await jobService.findAll({
    page,
    limit,
    sortType,
    sortBy,
    search,
  });

  res.status(200).json(jobs);
};

module.exports = findAll;
