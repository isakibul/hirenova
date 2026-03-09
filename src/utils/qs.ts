const generateQueryString = (query: Record<string, any>): string => {
  return Object.keys(query)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(query[key]),
    )
    .join("&");
};

export { generateQueryString };
