/**
 * Mongoose models for the application
 * @module models
 */
import Job from "./Job";
import User from "./User";

/**
 * Job document type
 * @type {import("./Job").IJob}
 */
export type { IJob } from "./Job";

/**
 * User document type
 * @type {import("./User").IUser}
 */
export type { IUser } from "./User";

/**
 * Job model
 * @type {import("mongoose").Model<IJob>}
 */
export { Job, User };
