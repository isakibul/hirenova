import { NextFunction, Request, Response } from "express";
import * as jobService from "../../../../lib/job";
import { jobSchema } from "../../../../lib/validators/jobValidator";

const updateItemByPatch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const { error, value } = jobSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        code: 400,
        message: "Validation Error",
        errors: error.details.map((err: any) => err.message),
      });
      return;
    }

    const {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
    } = value;

    const employerId = req.user!.id;

    const job = await jobService.updateItemUsingPatch(id, {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
      author: employerId,
    });

    const response = {
      code: 200,
      message: "Article updated successfully",
      data: job,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

export default updateItemByPatch;
