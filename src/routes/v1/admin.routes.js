const router = require("express").Router();
const { controllers: adminControllers } = require("../../api/v1/admin");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.post(
  "/users",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.addUser
);

router.get(
  "/users",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getAllUser
);

router.get(
  "/users/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.getSingleUser
);

router.patch(
  "/users/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.updateUser
);

router.patch(
  "/users/make-admin/:id",
  authenticate,
  authorize(["superadmin"]),
  adminControllers.makeAdmin
);

router.delete(
  "/users/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  adminControllers.removeUser
);

module.exports = router;
