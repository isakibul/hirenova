const serializeCompany = (author) => {
  if (!author) {
    return null;
  }

  const id = author._id?.toString?.() ?? author.id?.toString?.() ?? author.toString?.();

  if (!id || typeof author !== "object") {
    return null;
  }

  return {
    id,
    name: author.companyName || author.username || "Company",
    website: author.companyWebsite || "",
    size: author.companySize || "",
    about: author.companyAbout || "",
    username: author.username || "",
  };
};

const serializeJob = (job) => {
  const source = job._doc ?? job;
  return {
    ...source,
    id: job.id ?? source._id?.toString(),
    company: serializeCompany(source.author),
    author:
      typeof source.author === "object"
        ? source.author?._id?.toString?.() ?? source.author?.id?.toString?.()
        : source.author,
  };
};

module.exports = {
  serializeCompany,
  serializeJob,
};
