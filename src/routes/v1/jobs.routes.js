const router = require("express").Router();
const { controllers: jobControllers } = require("../../api/v1/job");
const { controllers: applicationControllers } = require("../../api/v1/application");
const { controllers: savedJobControllers } = require("../../api/v1/savedJob");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const checkUserStatus = require("../../middleware/checkUserStatus");
const ownership = require("../../middleware/ownership");

// jobseeker
router.get("/", jobControllers.findAll);
router.get("/:id", jobControllers.findSingle);

router.post(
  "/:id/apply",
  authenticate,
  checkUserStatus,
  authorize(["jobseeker"]),
  applicationControllers.apply
);

router.get(
  "/:id/applications",
  authenticate,
  authorize(["admin", "employer"]),
  applicationControllers.findForJob
);

router.post(
  "/:id/save",
  authenticate,
  checkUserStatus,
  authorize(["jobseeker"]),
  savedJobControllers.save
);

router.delete(
  "/:id/save",
  authenticate,
  authorize(["jobseeker"]),
  savedJobControllers.remove
);

// employer/admin
router.post(
  "/",
  authenticate,
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.create
);

router.delete(
  "/:id",
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.deleteItem
);

router.put(
  "/:id",
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.updateItem
);

router.patch(
  "/:id",
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.updateItemByPatch
);

module.exports = router;
