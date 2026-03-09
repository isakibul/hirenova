import { Document, Schema, Types, model } from "mongoose";

/**
 * Job document interface extending Mongoose Document
 * @interface IJob
 * @extends Document
 */
export interface IJob extends Document {
  title: string;
  description?: string;
  location?: string;
  jobType?: "full-time" | "part-time" | "remote" | "contract";
  skillsRequired?: string[];
  experienceRequired?: number;
  salary?: number;
  createdAt?: Date;
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
