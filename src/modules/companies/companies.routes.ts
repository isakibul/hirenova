const router = require("express").Router();
const companyControllers = require("./controllers");

router.get("/:id", companyControllers.findSingle);

module.exports = router;
