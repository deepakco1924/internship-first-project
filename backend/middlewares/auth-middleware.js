const tokenServices = require("../services/token-service");

module.exports = async function (req, res, next) {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new Error();
    }
    console.log(accessToken);
    const userData = await tokenServices.verifyAccessToken(accessToken);
    if (!userData) {
      throw new Error();
    }
    req.user = userData;
    console.log("userdata", userData);
    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({
      message: "inavalid tokek access",
    });
  }
};
