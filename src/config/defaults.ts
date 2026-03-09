interface Defaults {
  totalItems: number;
  limit: number;
  page: number;
  sortType: string;
  sortBy: string;
  search: string;
}

const config: Defaults = {
  totalItems: 0,
  limit: 10,
  page: 1,
  sortType: "dsc",
  sortBy: "updatedAt",
  search: "",
};

export default Object.freeze(config);
