const router = require("express").Router();
const { controllers: jobControllers } = require("../../api/v1/job");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const checkUserStatus = require("../../middleware/checkUserStatus");
const ownership = require("../../middleware/ownership");

// jobseeker
router.get("/", jobControllers.findAll);
router.get("/:id", jobControllers.findSingle);

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
