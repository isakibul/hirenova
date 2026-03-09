/**
 * Job routes
 * @module routes/v1/jobs.routes
 */
import { Router } from "express";
import { controllers as jobControllers } from "../../api/v1/job";
import authenticate from "../../middleware/authenticate";
import authorize from "../../middleware/authorize";
import checkUserStatus from "../../middleware/checkUserStatus";
import ownership from "../../middleware/ownership";

const router = Router();

/**
 * Jobseeker routes
 */
router.get("/", jobControllers.findAll);
router.get("/:id", authenticate, checkUserStatus, jobControllers.findSingle);

/**
 * Employer routes
 */
router.post(
  "/",
  authenticate,
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.create,
);

router.delete(
  "/:id",
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.deleteItem,
);

router.put(
  "/:id",
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.updateItem,
);

router.patch(
  "/:id",
  authenticate,
  ownership("Job"),
  checkUserStatus,
  authorize(["admin", "employer"]),
  jobControllers.updateItemByPatch,
);

export default router;
