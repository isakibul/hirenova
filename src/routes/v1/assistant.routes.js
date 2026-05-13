const router = require("express").Router();
const { controllers: assistantControllers } = require("../../api/v1/assistant");

router.post("/chat", assistantControllers.chat);

module.exports = router;
