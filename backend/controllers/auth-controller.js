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
  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
  });
  // const userDto = new UserDto(user);
  res.json({ accessToken });
};
