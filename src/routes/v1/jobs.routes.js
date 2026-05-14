const router = require("express").Router();
const { controllers: jobControllers } = require("../../api/v1/job");
const { controllers: applicationControllers } = require("../../api/v1/application");
const { controllers: savedJobControllers } = require("../../api/v1/savedJob");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const checkUserStatus = require("../../middleware/checkUserStatus");
const ownership = require("../../middleware/ownership");
const { writeLimiter } = require("../../middleware/rateLimits");

// jobseeker
router.get("/", jobControllers.findAll);

router.post(
  "/:id/apply",
  writeLimiter,
  authenticate,
  checkUserStatus,
  authorize(["jobseeker"]),
  applicationControllers.apply
);

router.get(
  "/:id/applications",
  authenticate,
  authorize(["admin", "superadmin", "employer"]),
  applicationControllers.findForJob
);

router.post(
  "/:id/save",
  writeLimiter,
  authenticate,
  checkUserStatus,
  authorize(["jobseeker"]),
  savedJobControllers.save
);

router.delete(
  "/:id/save",
  writeLimiter,
  authenticate,
  authorize(["jobseeker"]),
  savedJobControllers.remove
);

router.get("/:id", jobControllers.findSingle);

// employer/admin
router.post(
  "/",
  writeLimiter,
  authenticate,
  checkUserStatus,
  authorize(["admin", "superadmin", "employer"]),
  jobControllers.create
);

router.delete(
  "/:id",
  writeLimiter,
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "superadmin", "employer"]),
  jobControllers.deleteItem
);

router.patch(
  "/:id/status",
  writeLimiter,
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "superadmin", "employer"]),
  jobControllers.updateStatus
);

router.patch(
  "/:id/approval",
  writeLimiter,
  authenticate,
  authorize(["admin", "superadmin"]),
  jobControllers.updateApproval
);

router.put(
  "/:id",
  writeLimiter,
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "superadmin", "employer"]),
  jobControllers.updateItem
);

router.patch(
  "/:id",
  writeLimiter,
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "superadmin", "employer"]),
  jobControllers.updateItemByPatch
);

module.exports = router;
