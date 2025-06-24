const express = require("express");
const router = require("./routes/index");

const app = express();

app.use(express.json());

app.use(router);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
