const router = require("express").Router();
const { controllers: messageControllers } = require("../../api/v1/message");
const authenticate = require("../../middleware/authenticate");
const checkUserStatus = require("../../middleware/checkUserStatus");

router.get("/conversations", authenticate, messageControllers.findMine);
router.post(
  "/conversations",
  authenticate,
  checkUserStatus,
  messageControllers.start
);
router.get("/conversations/:id", authenticate, messageControllers.findSingle);
router.post(
  "/conversations/:id/messages",
  authenticate,
  checkUserStatus,
  messageControllers.send
);

module.exports = router;
