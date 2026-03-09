import { Router } from "express";
import { controllers as adminControllers } from "../../api/v1/admin";
import authenticate from "../../middleware/authenticate";
import authorize from "../../middleware/authorize";

const router = Router();

router.post(
  "/users",
  authenticate,
  authorize(["admin"]),
  adminControllers.addUser,
);

router.get(
  "/users",
  authenticate,
  authorize(["admin"]),
  adminControllers.getAllUser,
);

router.get(
  "/users/:id",
  authenticate,
  authorize(["admin"]),
  adminControllers.getSingleUser,
);

router.patch(
  "/users/make-admin/:id",
  authenticate,
  authorize(["admin"]),
  adminControllers.makeAdmin,
);

router.delete(
  "/users/:id",
  authenticate,
  authorize(["admin"]),
  adminControllers.removeUser,
);

export default router;
