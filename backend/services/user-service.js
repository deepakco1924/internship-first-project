const User = require("../models/user-model");
exports.findUser = async (filter) => {
  const user = await User.findOne(filter);
  return user;
};
exports.createUser = async (data) => {
  const user = await User.create(data);
  return user;
};
