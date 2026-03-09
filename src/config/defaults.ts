/**
 * Default configuration interface for pagination and sorting
 * @interface Defaults
 */
interface Defaults {
  /** Default total items count */
  totalItems: number;
  /** Default items per page limit */
  limit: number;
  /** Default page number */
  page: number;
  /** Default sort type (asc/dsc) */
  sortType: string;
  /** Default sort field */
  sortBy: string;
  /** Default search query */
  search: string;
}

/**
 * Default configuration object for the application
 * @type {Defaults}
 */
const config: Defaults = {
  totalItems: 0,
  limit: 10,
  page: 1,
  sortType: "dsc",
  sortBy: "updatedAt",
  search: "",
};

export default Object.freeze(config);
