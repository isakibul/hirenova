import mongoose from "mongoose";

const dbConnectionString = process.env.DATABASE_CONNECTION_URL;
const dbName = process.env.DB_NAME;

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<void>}
 * @throws Will throw an error if connection fails
 */
const connectDatabase = (): void => {
  if (!dbConnectionString || !dbName) {
    throw new Error("Missing MongoDB connection string or DB name");
  }

  mongoose.connect(dbConnectionString, { dbName: dbName });
  console.log("Database connection successful");
};

export default connectDatabase;
