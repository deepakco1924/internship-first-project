const jwt = require("jsonwebtoken");
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

const Refresh = require("../models/refreshToken-model");

exports.generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "10h",
  });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "1y",
  });
  return { accessToken, refreshToken };
};

exports.storeRefreshToken = async (token, userId) => {
  try {
    await Refresh.create({
      token,
      userId,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.verifyAccessToken = async (accessToken) => {
  return jwt.verify(accessToken, accessTokenSecret);
};

exports.verifyRefreshToken = async (refreshToken) => {
  return jwt.verify(refreshToken, refreshTokenSecret);
};

exports.findRefreshToken = async (userId, refreshToken) => {
  return await Refresh.findOne({
    userId: userId,
    token: refreshToken,
  });
};

exports.updateRefreshToken = async (userId, refreshToken) => {
  return await Refresh.updateOne(
    {
      userId: userId,
    },
    { token: refreshToken }
  );
};

exports.removeToken = async (refreshToken) => {
  return await Refresh.deleteOne({ token: refreshToken });
};
