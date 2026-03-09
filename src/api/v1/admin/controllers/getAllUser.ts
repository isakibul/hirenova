/**
 * Get all users controller (admin)
 * @module api/v1/admin/controllers/getAllUser
 */
import { NextFunction, Request, Response } from "express";
import defaults from "../../../../config/defaults";
import * as userService from "../../../../lib/user";
import {
  getHATEOASforAllItems,
  getPagination,
  getTransformedItems,
} from "../../../../utils/getPagination";

/**
 * Retrieves all users with pagination, sorting, and search (admin only)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = Number(req.query.page) || defaults.page;
  const limit = Number(req.query.limit) || defaults.limit;
  const sortType = (req.query.sort_type as string) || defaults.sortType;
  const sortBy = (req.query.sort_by as string) || defaults.sortBy;
  const search = (req.query.search as string) || "";

  try {
    const user = await userService.getAllUser({
      page,
      limit,
      sortType,
      sortBy,
      search,
    });

    const data = getTransformedItems({
      items: user,
      path: "./user",
      selection: ["id", "name", "email", "createdAt"],
    });

    const totalItems = await userService.count({ search });

    const pagination = getPagination({ totalItems, limit, page });

    const links = getHATEOASforAllItems({
      url: req.url,
      path: req.path,
      query: req.query,
      hasNext: !!pagination.next,
      hasPrev: !!pagination.prev,
      page,
    });

    const response = {
      data,
      pagination,
      links,
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

export default getAllUser;
