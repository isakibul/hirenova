const router = require("express").Router();
const notificationControllers = require("./controllers");
const authenticate = require("../../middleware/authenticate");

router.get("/", authenticate, notificationControllers.findMine);
router.patch("/read-all", authenticate, notificationControllers.markAllRead);
router.patch("/:id/read", authenticate, notificationControllers.markRead);

module.exports = router;
