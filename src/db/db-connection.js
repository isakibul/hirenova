const mongoose = require("mongoose");

const dbConnectionString = process.env.DATABASE_CONNECTION_URL;
const dbName = process.env.DB_NAME;

const connectDatabase = () => {
  mongoose.connect(dbConnectionString, { dbName: dbName });
  console.log("Database connection successful");
};

module.exports = connectDatabase;
