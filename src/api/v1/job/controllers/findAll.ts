import { NextFunction, Request, Response } from "express";
import defaults from "../../../../config/defaults";
import * as jobService from "../../../../lib/job";
import {
  getHATEOASforAllItems,
  getPagination,
  getTransformedItems,
} from "../../../../utils/getPagination";

const findAll = async (
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
    const jobs = await jobService.findAll({
      page,
      limit,
      sortType,
      sortBy,
      search,
    });

    const data = getTransformedItems({
      items: jobs,
      path: "./job",
      selection: ["id", "title", "updatedAt", "createdAt"],
    });

    const totalItems = await jobService.count({ search });
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

export default findAll;
