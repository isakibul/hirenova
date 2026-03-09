/**
 * Job service module for database operations
 * @module lib/job
 */
import { Job } from "../../model";
import { notFound } from "../../utils/error";

/**
 * Parameters for creating a job
 * @interface JobParams
 */
interface JobParams {
  /** Job title */
  title: string;
  /** Job description */
  description?: string;
  /** Job location */
  location?: string;
  /** Type of job */
  jobType?: string;
  /** Required skills */
  skillsRequired?: string[];
  /** Years of experience required */
  experienceRequired?: number;
  /** Salary offered */
  salary?: number;
  /** ID of the job author */
  author?: string;
}

/**
 * Creates a new job posting
 * @async
 * @param {JobParams} params - Job creation parameters
 * @returns {Promise<any>} Created job document with ID
 */
const create = async ({
  title,
  description,
  location,
  jobType,
  skillsRequired,
  experienceRequired,
  salary,
  author,
}: JobParams): Promise<any> => {
  const job = new Job({
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
    author,
  });

  await job.save();

  return {
    ...(job as any)._doc,
    id: job.id,
  };
};

/**
 * Deletes a job posting
 * @async
 * @param {string} id - Job's unique identifier
 * @returns {Promise<any>} Deleted job document
 * @throws {Error} If job not found
 */
const deleteItem = async (id: string): Promise<any> => {
  const job = await Job.findById(id);

  if (!job) {
    throw notFound("Job not found");
  }

  return Job.findByIdAndDelete(id);
};

/**
 * Result of job update operation
 * @interface UpdateItemResult
 */
interface UpdateItemResult {
  /** Updated job document */
  job: any;
  /** HTTP status code (200 for update, 201 for create) */
  statusCode: number;
}

/**
 * Updates or creates a job (full replacement)
 * @async
 * @param {string} id - Job's unique identifier
 * @param {JobParams} params - Job update parameters
 * @returns {Promise<UpdateItemResult>} Updated job and status code
 */
const updateItem = async (
  id: string,
  params: JobParams,
): Promise<UpdateItemResult> => {
  const {
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
    author,
  } = params;

  const job = await Job.findById(id);

  if (!job) {
    const newJob = await create({
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
      author,
    });

    return {
      job: newJob,
      statusCode: 201,
    };
  }

  const payload = {
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
    author,
  };

  (job as any).overwrite(payload);
  await job.save();

  return {
    job: { ...(job as any)._doc, id: (job as any)._id },
    statusCode: 200,
  };
};

/**
 * Updates a job using PATCH method (partial update)
 * @async
 * @param {string} id - Job's unique identifier
 * @param {JobParams} params - Job update parameters
 * @returns {Promise<any>} Updated job document
 * @throws {Error} If job not found
 */
const updateItemUsingPatch = async (
  id: string,
  params: JobParams,
): Promise<any> => {
  const {
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
    author,
  } = params;

  const job = await Job.findById(id);

  if (!job) {
    throw notFound();
  }

  const payload: Record<string, any> = {
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
    author,
  };

  Object.keys(payload).forEach((key) => {
    (job as any)[key] = payload[key] ?? (job as any)[key];
  });

  await job.save();
  return { ...(job as any)._doc, id: job.id };
};

/**
 * Parameters for finding all jobs
 * @interface FindAllParams
 */
interface FindAllParams {
  /** Page number for pagination */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Sort type (asc or dsc) */
  sortType: string;
  /** Field to sort by */
  sortBy: string;
  /** Search query string */
  search: string;
}

/**
 * Retrieves all jobs with pagination and search
 * @async
 * @param {FindAllParams} params - Query parameters
 * @returns {Promise<any[]>} Array of job documents
 */
const findAll = async ({
  page,
  limit,
  sortType,
  sortBy,
  search,
}: FindAllParams): Promise<any[]> => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = { title: { $regex: search, $options: "i" } };

  const jobs = await Job.find(filter)
    .sort(sortStr)
    .skip(page * limit - limit)
    .limit(limit);

  return jobs.map((job: any) => ({
    ...job._doc,
    id: job.id,
  }));
};

/**
 * Counts total number of jobs matching search criteria
 * @async
 * @param {{ search?: string }} params - Count parameters
 * @returns {Promise<number>} Total count of jobs
 */
const count = ({ search = "" }: { search?: string }): Promise<number> => {
  const filter = {
    title: { $regex: search, $options: "i" },
  };
  return Job.countDocuments(filter);
};

/**
 * Parameters for finding a single job
 * @interface FindSingleParams
 */
interface FindSingleParams {
  /** Job's unique identifier */
  id: string;
  /** Optional expansion parameter */
  expand?: string;
}

/**
 * Retrieves a single job by ID
 * @async
 * @param {FindSingleParams} params - Query parameters
 * @returns {Promise<any>} Job document
 * @throws {Error} If ID is missing or job not found
 */
const findSingle = async ({
  id,
  expand = "",
}: FindSingleParams): Promise<any> => {
  if (!id) throw new Error("Id is required");

  const job = await Job.findById(id).lean();

  if (!job) throw notFound();

  return job;
};

/**
 * Parameters for checking job ownership
 * @interface CheckOwnershipParams
 */
interface CheckOwnershipParams {
  /** Job's unique identifier */
  resourceId: string;
  /** User's unique identifier */
  userId: string;
}

/**
 * Checks if a user owns a job posting
 * @async
 * @param {CheckOwnershipParams} params - Ownership check parameters
 * @returns {Promise<boolean>} True if user owns the job, false otherwise
 * @throws {Error} If job not found
 */
const checkOwnership = async ({
  resourceId,
  userId,
}: CheckOwnershipParams): Promise<boolean> => {
  const job = await Job.findById(resourceId);

  if (!job) throw notFound("Job not found");

  if ((job as any)._doc.author.toString() === userId) {
    return true;
  }
  return false;
};

export {
  checkOwnership,
  count,
  create,
  deleteItem,
  findAll,
  findSingle,
  updateItem,
  updateItemUsingPatch,
};
