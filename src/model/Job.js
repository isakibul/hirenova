const { Schema, model } = require("mongoose");

const jobSchema = Schema({
  title: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 150,
  },
  description: {
    type: String,
    maxLength: 5000,
  },
  location: {
    type: String,
    maxLength: 100,
  },
  jobType: {
    type: String,
    enum: ["full-time", "part-time", "remote", "contract"],
  },
  skillsRequired: [String],
  experienceRequired: Number,
  salary: Number,
  createdAt: { type: Date, default: Date.now() },
});

const Job = model("Job", jobSchema);
module.exports = Job;
