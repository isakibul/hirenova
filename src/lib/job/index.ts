import { Job } from "../../model";
import { notFound } from "../../utils/error";

interface JobParams {
  title: string;
  description?: string;
  location?: string;
  jobType?: string;
  skillsRequired?: string[];
  experienceRequired?: number;
  salary?: number;
  author?: string;
}

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

const deleteItem = async (id: string): Promise<any> => {
  const job = await Job.findById(id);

  if (!job) {
    throw notFound("Job not found");
  }

  return Job.findByIdAndDelete(id);
};

interface UpdateItemResult {
  job: any;
  statusCode: number;
}

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

interface FindAllParams {
  page: number;
  limit: number;
  sortType: string;
  sortBy: string;
  search: string;
}

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

const count = ({ search = "" }: { search?: string }): Promise<number> => {
  const filter = {
    title: { $regex: search, $options: "i" },
  };
  return Job.countDocuments(filter);
};

interface FindSingleParams {
  id: string;
  expand?: string;
}

const findSingle = async ({
  id,
  expand = "",
}: FindSingleParams): Promise<any> => {
  if (!id) throw new Error("Id is required");

  const job = await Job.findById(id).lean();

  if (!job) throw notFound();

  return job;
};

interface CheckOwnershipParams {
  resourceId: string;
  userId: string;
}

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
