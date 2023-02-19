const userServices = require("../services/user-service");
exports.activate = async (req, res, next) => {
  const { name, avatar } = req.body;
  if (!name || !avatar) {
    res.status(400).json({
      message: "all feilds required",
    });
  }
  const userId = req.user._id;
  try {
    const user = await userServices.findUser({ _id: userId });
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
    user.activated = true;
    user.name = name;
    user.avatar = avatar;
    await user.save();
    const userDataResponse = {
      id: user._id,
      avatar: user.avatar,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt,
      activated: user.activated,
    };
    res.json({ message: "activated avatar", auth: true, user });
  } catch (err) {
    res.status(500).json({ message: "something wrong in databse" });
  }
};
