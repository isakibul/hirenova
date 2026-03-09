/**
 * Update job controller (full replacement)
 * @module api/v1/job/controllers/updateItem
 */
import { NextFunction, Request, Response } from "express";
import * as jobService from "../../../../lib/job";
import { jobSchema } from "../../../../lib/validators/jobValidator";

/**
 * Handles job update (full replacement) or creation if not exists
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const updateItem = async (
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

    const { job, statusCode } = await jobService.updateItem(id, {
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
      code: statusCode,
      message:
        statusCode === 200
          ? "Job updated successfully"
          : "Job created successfully",
      data: job,
      link: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(statusCode).json(response);
  } catch (e) {
    next(e);
  }
};

export default updateItem;
