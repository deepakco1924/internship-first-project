const otpServices = require("../services/otp-service");
const hashServices = require("../services/hash-service");
exports.sendOtp = async (req, res, next) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ message: "phone field is required" });
  }
  //otp genrate kregnge
  const otp = await otpServices.generateOtp();

  //hash kregnge
  const ttl = 1000 * 60 * 5;
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
  res.send(`hellow from otp route bro1 ${hash}`);
};

exports.verifyOtp = (req, res, next) => {
  const { otp, hash, phone } = req.body;
  if (!otp || !hash || !phone) {
    res.status(400).json({ message: "all fields required" });
  }
  const [hashedOtp, expires] = hash.split(".");
  if (Date.now() > +expires) {
    res.status(400).json({ message: "your otp expires" });
  }
  const data = `${phone}.${otp}.${expires}`;
  const isValid = otpServices.verifyOtp(hashedOtp, data);
  if (!isValid) {
    res.status(400).json({ message: "Invalid otp" });
  }
  let user;
  let accessToken;
  let refreshToken;
};
