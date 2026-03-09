/**
 * Job creation controller
 * @module api/v1/job/controllers/create
 */
import { NextFunction, Request, Response } from "express";
import * as jobService from "../../../../lib/job";

/**
 * Handles job creation by authenticated employers
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
    } = req.body;

    const employerId = req.user!.id;

    const job = await jobService.create({
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
      code: 201,
      message: "Job created successfully",
      data: { ...job },
      links: {
        self: `/api/jobs/${job._id}`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};

export default create;
