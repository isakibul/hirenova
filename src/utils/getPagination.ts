import defaults from "../config/defaults";
import { generateQueryString } from "./qs";

interface PaginationOptions {
  totalItems?: number;
  limit?: number;
  page?: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPage: number;
  next?: number;
  prev?: number;
}

const getPagination = ({
  totalItems = defaults.totalItems,
  limit = defaults.limit,
  page = defaults.page,
}: PaginationOptions): Pagination => {
  const totalPage = Math.ceil(totalItems / limit);
  const pagination: Pagination = {
    page,
    limit,
    totalItems,
    totalPage,
  };

  if (page < totalPage) {
    pagination.next = page + 1;
  }
  if (page > 1) {
    pagination.prev = page - 1;
  }

  return pagination;
};

interface HATEOASOptions {
  url?: string;
  path?: string;
  query?: Record<string, any>;
  hasNext?: boolean;
  hasPrev?: boolean;
  page?: number;
}

const getHATEOASforAllItems = ({
  url = "/",
  path = "",
  query = {},
  hasNext = false,
  hasPrev = false,
  page = 1,
}: HATEOASOptions): Record<string, string> => {
  const links: Record<string, string> = {
    self: url,
  };

  if (hasNext) {
    const queryStr = generateQueryString({ ...query, page: page + 1 });
    links.next = `${path}?${queryStr}`;
  }
  if (hasPrev) {
    const queryStr = generateQueryString({ ...query, page: page - 1 });
    links.prev = `${path}?${queryStr}`;
  }

  return links;
};

interface TransformOptions {
  items?: any[];
  selection?: string[];
  path?: string;
}

const getTransformedItems = ({
  items = [],
  selection = [],
  path = "/",
}: TransformOptions): any[] => {
  if (!Array.isArray(items) || !Array.isArray(selection)) {
    throw new Error("Invalid selection");
  }

  if (selection.length === 0) {
    return items.map((item) => ({ ...item, link: `${path}/${item.id}` }));
  }

  return items.map((item) => {
    const result: Record<string, any> = {};
    selection.forEach((key) => {
      result[key] = item[key];
    });
    result.link = `${path}/${item.id}`;
    return result;
  });
};

export { getHATEOASforAllItems, getPagination, getTransformedItems };
