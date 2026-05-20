const controllers = require("./controllers");
const routes = require("./jobs.routes");
const service = require("./jobs.service");
const validation = require("./jobs.validation");

module.exports = {
  controllers,
  routes,
  service,
  validation,
};
