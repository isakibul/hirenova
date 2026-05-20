const defaults = require("../../../config/defaults");
const recommendationService = require("../../../lib/jobRecommendation");
const {
  getPagination,
  getHATEOASforAllItems,
} = require("../../../utils/getPagination");

const recommended = async (req, res, next) => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Math.min(Number(req.query.limit) || defaults.limit, 50);

  try {
    const result = await recommendationService.getRecommendedJobs({
      userId: req.user.id,
      page,
      limit,
      search: req.query.search || "",
      location: req.query.location || "",
      jobType: req.query.job_type || "",
      skills: req.query.skills || "",
      minSalary: req.query.min_salary,
      maxSalary: req.query.max_salary,
      minExperience: req.query.min_experience,
      maxExperience: req.query.max_experience,
    });
    const pagination = getPagination({
      totalItems: result.totalItems,
      limit,
      page,
    });
    const links = getHATEOASforAllItems({
      url: req.url,
      path: req.path,
      query: req.query,
      hasNext: !!pagination.next,
      hasPrev: !!pagination.prev,
      page,
    });

    res.status(200).json({
      data: result.jobs,
      pagination,
      recommendation: {
        mode: "smart-match",
        rankedItems: result.rankedItems,
        availableItems: result.availableItems,
        minScore: result.minScore,
        maxResults: result.maxResults,
        explanation:
          "Jobs are filtered by your search criteria, then only relevant profile matches are ranked with Smart Match signals.",
      },
      links,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = recommended;
