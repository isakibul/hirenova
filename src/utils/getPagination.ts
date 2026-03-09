import defaults from "../config/defaults";
import { generateQueryString } from "./qs";

/**
 * Options for pagination calculation
 * @interface PaginationOptions
 */
interface PaginationOptions {
  /** Total number of items */
  totalItems?: number;
  /** Number of items per page */
  limit?: number;
  /** Current page number */
  page?: number;
}

/**
 * Pagination result object
 * @interface Pagination
 */
interface Pagination {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPage: number;
  /** Next page number (if available) */
  next?: number;
  /** Previous page number (if available) */
  prev?: number;
}

/**
 * Calculates pagination metadata for a list of items
 * @param {PaginationOptions} options - Pagination options
 * @param {number} [options.totalItems=defaults.totalItems] - Total number of items
 * @param {number} [options.limit=defaults.limit] - Items per page
 * @param {number} [options.page=defaults.page] - Current page
 * @returns {Pagination} Pagination object with page info and next/prev links
 */
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

/**
 * Options for HATEOAS links generation
 * @interface HATEOASOptions
 */
interface HATEOASOptions {
  /** Base URL for the API */
  url?: string;
  /** API path */
  path?: string;
  /** Query parameters */
  query?: Record<string, any>;
  /** Whether there's a next page */
  hasNext?: boolean;
  /** Whether there's a previous page */
  hasPrev?: boolean;
  /** Current page number */
  page?: number;
}

/**
 * Generates HATEOAS links for pagination
 * @param {HATEOASOptions} options - HATEOAS options
 * @returns {Record<string, string>} Object containing self, next, and prev links
 */
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

/**
 * Options for transforming items
 * @interface TransformOptions
 */
interface TransformOptions {
  /** Array of items to transform */
  items?: any[];
  /** Array of keys to select from each item */
  selection?: string[];
  /** Base path for generating links */
  path?: string;
}

/**
 * Transforms array items by adding links and optionally filtering properties
 * @param {TransformOptions} options - Transform options
 * @returns {any[]} Transformed items with links
 * @throws {Error} If items or selection is not an array
 */
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
