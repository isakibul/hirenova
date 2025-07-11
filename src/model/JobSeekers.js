const { Schema, model } = require("mongoose");

const jobSeekerSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      maxLength: 50,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const JobSeekers = model("JobSeekers", jobSeekerSchema);
module.exports = JobSeekers;
