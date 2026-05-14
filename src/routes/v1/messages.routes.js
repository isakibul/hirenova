const router = require("express").Router();
const { controllers: messageControllers } = require("../../api/v1/message");
const authenticate = require("../../middleware/authenticate");
const checkUserStatus = require("../../middleware/checkUserStatus");
const { writeLimiter } = require("../../middleware/rateLimits");

router.get("/conversations", authenticate, messageControllers.findMine);
router.post(
  "/conversations",
  writeLimiter,
  authenticate,
  checkUserStatus,
  messageControllers.start
);
router.get("/conversations/:id", authenticate, messageControllers.findSingle);
router.delete(
  "/conversations/:id",
  writeLimiter,
  authenticate,
  checkUserStatus,
  messageControllers.deleteForMe
);
router.post(
  "/conversations/:id/messages",
  writeLimiter,
  authenticate,
  checkUserStatus,
  messageControllers.send
);

module.exports = router;
