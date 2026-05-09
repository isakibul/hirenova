const jobService = require("../../../../lib/job");
const defaults = require("../../../../config/defaults");
const {
  getTransformedItems,
  getPagination,
  getHATEOASforAllItems,
} = require("../../../../utils/getPagination");

const findAll = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Number(req.query.limit) || defaults.limit;
  const sortType = req.query.sort_type || defaults.sortType;
  const sortBy = req.query.sort_by || defaults.sortBy;
  const search = req.query.search || "";
  const location = req.query.location || "";
  const jobType = req.query.job_type || "";
  const skills = req.query.skills || "";
  const minSalary = req.query.min_salary;
  const maxSalary = req.query.max_salary;
  const minExperience = req.query.min_experience;
  const maxExperience = req.query.max_experience;

  try {
    const jobs = await jobService.findAll({
      page,
      limit,
      sortType,
      sortBy,
      search,
      location,
      jobType,
      skills,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
    });

    const data = getTransformedItems({
      items: jobs,
      path: "./job",
      selection: [
        "id",
        "title",
        "location",
        "jobType",
        "salary",
        "experienceRequired",
        "experienceMin",
        "experienceMax",
        "skillsRequired",
        "updatedAt",
        "createdAt",
      ],
    });

    const totalItems = await jobService.count({
      search,
      location,
      jobType,
      skills,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
    });
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

module.exports = findAll;
