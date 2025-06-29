const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);
};

module.exports = register;
