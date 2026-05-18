const router = require("express").Router();
const { controllers: companyControllers } = require("../../api/v1/company");

router.get("/:id", companyControllers.findSingle);

module.exports = router;
