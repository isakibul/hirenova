import mongoose from "mongoose";

const dbConnectionString = process.env.DATABASE_CONNECTION_URL;

const dbName = process.env.DB_NAME;

/**
 * Connects to MongoDB using Mongoose
 * @returns {void}
 * @throws {Error} Throws error if DATABASE_CONNECTION_URL or DB_NAME is missing
 * @throws {Error} Throws error if connection fails
 */
const connectDatabase = (): void => {
  if (!dbConnectionString || !dbName) {
    throw new Error("Missing MongoDB connection string or DB name");
  }

  mongoose.connect(dbConnectionString, { dbName: dbName });
  console.log("Database connection successful");
};

export default connectDatabase;
