const router = require("express").Router();
const { controllers: notificationControllers } = require("../../api/v1/notification");
const authenticate = require("../../middleware/authenticate");

router.get("/", authenticate, notificationControllers.findMine);
router.patch("/read-all", authenticate, notificationControllers.markAllRead);
router.patch("/:id/read", authenticate, notificationControllers.markRead);

module.exports = router;
