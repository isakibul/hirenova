export function toSearchParams(values = {}) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          params.append(key, String(item));
        }
      });
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}

export function toQueryString(values = {}) {
  return toSearchParams(values).toString();
}
