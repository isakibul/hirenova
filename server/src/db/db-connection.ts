const mongoose = require("mongoose");
const logger = require("../infrastructure/observability/logger");

const dbConnectionString = process.env.DATABASE_CONNECTION_URL;
const dbName = process.env.DB_NAME;

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<void>}
 * @throws Will throw an error if connection fails
 */
const connectDatabase = async () => {
  if (!dbConnectionString || !dbName) {
    throw new Error("Set DATABASE_CONNECTION_URL and DB_NAME before starting the API.");
  }

  await mongoose.connect(dbConnectionString, { dbName });
  // Verify database access before reporting startup success.
  await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
  logger.info("MongoDB connected", {
    component: "database",
    database: dbName,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  });
};

module.exports = connectDatabase;
