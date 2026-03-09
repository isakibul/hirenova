import { Document, Schema, Types, model } from "mongoose";

/**
 * Job document interface extending Mongoose Document
 * @interface IJob
 * @extends Document
 */
export interface IJob extends Document {
  /** Job title (required, 10-150 characters) */
  title: string;
  /** Job description (up to 5000 characters) */
  description?: string;
  /** Job location (up to 100 characters) */
  location?: string;
  /** Type of job: full-time, part-time, remote, or contract */
  jobType?: "full-time" | "part-time" | "remote" | "contract";
  /** Array of required skills */
  skillsRequired?: string[];
  /** Years of experience required */
  experienceRequired?: number;
  /** Salary offered for the position */
  salary?: number;
  /** Creation timestamp */
  createdAt?: Date;
  /** Reference to the job author (User) */
  author?: Types.ObjectId;
}

/**
 * Mongoose schema for Job model
 * @type {Schema<IJob>}
 */
const jobSchema = new Schema<IJob>({
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
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Job = model<IJob>("Job", jobSchema);
export default Job;
