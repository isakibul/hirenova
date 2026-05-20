const controllers = require("./controllers");
const routes = require("./applications.routes");
const service = require("./applications.service");
const validation = require("./applications.validation");

module.exports = {
  controllers,
  routes,
  service,
  validation,
};
