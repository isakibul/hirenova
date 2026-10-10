const controllers = require("./controllers");
const routes = require("./auth.routes");
const service = require("./auth.service");
const validation = require("./auth.validation");

module.exports = {
  controllers,
  routes,
  service,
  validation,
};
