/**
 * Default configuration interface for pagination and sorting
 * @interface Defaults
 */
interface Defaults {
  totalItems: number;
  limit: number;
  page: number;
  sortType: string;
  sortBy: string;
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
