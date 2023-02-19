const otpServices = require("../services/otp-service");
const hashServices = require("../services/hash-service");
const userServices = require("../services/user-service");
const tokenServices = require("../services/token-service");

exports.sendOtp = async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ message: "phone field is required" });
  }
  //otp genrate kregnge
  const otp = await otpServices.generateOtp();

  //hash kregnge
  const ttl = 1000 * 60 * 20;
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash = hashServices.hashOtp(data);

  //send otp
  try {
    await otpServices.sendBySms(phone, otp);
    return res.json({
      hash: `${hash}.${expires}`,
      phone: phone,
      message: "otp send succesfully",
      otp: otp,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "message sending failed please try again later" });
  }
};

exports.verifyOtp = async (req, res, next) => {
  const { otp, hash, phone } = req.body;
  if (!otp || !hash || !phone) {
    res.status(400).json({ message: "All fields are required!" });
  }

  const [hashedOtp, expires] = hash.split(".");
  if (Date.now() > +expires) {
    res.status(400).json({ message: "OTP expired! please try again bro" });
  }

  const data = `${phone}.${otp}.${expires}`;
  const isValid = otpServices.verifyOtp(hashedOtp, data);

  if (!isValid) {
    res.status(400).json({ message: "Invalid OTP" });
  }

  let user;
  try {
    user = await userServices.findUser({ phone });
    if (!user) {
      user = await userServices.createUser({ phone });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Db error" });
  }

  const { accessToken, refreshToken } = tokenServices.generateTokens({
    _id: user._id,
    activated: false,
  });
  console.log({ accessToken, refreshToken });

  await tokenServices.storeRefreshToken(refreshToken, user._id);
  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  const userData = {
    _id: user._id,
    activated: user.activated,
    createdAt: user.createdAt,
    phone: user.phone,
  };
  res.json({ user: userData, auth: true });
};

exports.refresh = async (req, res, next) => {
  //get refresh tokens from our cokkies
  const { refreshToken: refreshTokenFromCookie } = req.cookies;

  //checing if toke valid or not
  let userData;
  try {
    userData = await tokenServices.verifyRefreshToken(refreshTokenFromCookie);
  } catch (err) {
    return res.status(401).json({ message: "invalid token" });
  }

  //check if token is in database
  try {
    const token = await tokenServices.findRefreshToken(
      userData._id,
      refreshTokenFromCookie
    );
    if (!token) {
      return res.status(401).json({ message: "invalid token" });
    }
  } catch (err) {
    return res.status(500).json({ message: "internal error" });
  }

  //check valid user;
  const user = await userServices.findUser({ _id: userData._id });
  if (!user) {
    return res.status(404).json({ message: "no user found" });
  }
  //generate our new token accestoekn and refreshtook
  const { accessToken, refreshToken } = tokenServices.generateTokens({
    _id: userData._id,
  });

  //update refresh token;
  try {
    await tokenServices.updateRefreshToken(userData._id, refreshToken);
  } catch (err) {
    return res.status(500).json({ message: "internal error" });
  }

  //put in cookie
  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  //response
  const userDataResponse = {
    _id: user._id,
    avatar: user.avatar,
    name: user.name,
    phone: user.phone,
    activated: user.activated,
    createdAt: user.createdAt,
  };
  console.log("token refreshed bro");
  res.status(201).json({
    user: userDataResponse,
    auth: true,
  });
};

exports.logout = async (req, res, next) => {
  //delete refresh token
  const { refreshToken } = req.cookies;
  await tokenServices.removeToken(refreshToken);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  
  res.json({user:null,auth:false,message:"user logout succesfully"})
  //delete cookie
};
