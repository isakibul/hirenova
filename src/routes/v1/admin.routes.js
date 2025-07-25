const router = require("express").Router();
const { controllers: adminControllers } = require("../../api/v1/admin");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

router.post(
  "/users",
  authenticate,
  authorize(["admin"]),
  adminControllers.addUser
);

router.get(
  "/users",
  authenticate,
  authorize(["admin"]),
  adminControllers.getAllUser
);

router.get(
  "/users/:id",
  authenticate,
  authorize(["admin"]),
  adminControllers.getSingleUser
);

router.patch(
  "/users/make-admin/:id",
  authenticate,
  authorize(["admin"]),
  adminControllers.makeAdmin
);

router.delete(
  "/users/:id",
  authenticate,
  authorize(["admin"]),
  adminControllers.removeUser
);

module.exports = router;
