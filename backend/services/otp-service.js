const crypto = require("crypto");
const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const hashServices = require("../services/hash-service");
const twilio = require("twilio")(smsSid, smsAuthToken, {
  lazyLoading: true,
});

exports.generateOtp = async () => {
  const otp = crypto.randomInt(1000, 9999);
  return otp;
};
exports.sendBySms = async (phone, otp) => {
  return await twilio.messages.create({
    to: phone,
    from: process.env.SMS_FROM_NUMBER,
    body: `your otp for project is ${otp}`,
  });
};
exports.verifyOtp = (hashedOtp, data) => {
  let computedHash = hashServices.hashOtp(data);
  if (computedHash === hashedOtp) {
    return true;
  }
  return false;
};
