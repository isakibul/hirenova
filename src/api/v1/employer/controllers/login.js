const login = async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
};

module.exports = login;
