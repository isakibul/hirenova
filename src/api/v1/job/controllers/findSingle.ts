/**
 * Find single job controller
 * @module api/v1/job/controllers/findSingle
 */
import { NextFunction, Request, Response } from "express";
import * as jobService from "../../../../lib/job";

/**
 * Retrieves a single job by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const findSingle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id as string;
  const expand = (req.query.expand as string) || "";

  try {
    const job = await jobService.findSingle({ id, expand });

    res.status(200).json({
      data: job,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

export default findSingle;
