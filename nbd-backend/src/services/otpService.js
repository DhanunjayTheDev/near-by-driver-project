const OtpLog = require('../models/OtpLog');
const generateOTP = require('../utils/generateOTP');
const redis = require('../config/redis');

const OTP_EXPIRY_MINUTES = 5;
const OTP_RATE_LIMIT_SECONDS = 60;

const sendOTP = async (phone, purpose = 'LOGIN') => {
  const rateLimitKey = `otp_rate:${phone}`;
  const isRateLimited = await redis.get(rateLimitKey);
  if (isRateLimited) {
    throw new Error('Please wait before requesting another OTP');
  }

  const otp_code = generateOTP(6);
  const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OtpLog.create({ phone, otp_code, purpose, expires_at });
  await redis.setex(rateLimitKey, OTP_RATE_LIMIT_SECONDS, '1');
  await redis.setex(`otp:${phone}`, OTP_EXPIRY_MINUTES * 60, otp_code);

  // TODO: Integrate SMS gateway (Twilio / MSG91) for production
  console.log(`[OTP] ${phone}: ${otp_code}`);

  return { message: 'OTP sent successfully' };
};

const verifyOTP = async (phone, otp_code) => {
  const storedOtp = await redis.get(`otp:${phone}`);
  if (!storedOtp) throw new Error('OTP expired or not found');
  if (storedOtp !== otp_code) throw new Error('Invalid OTP');

  await redis.del(`otp:${phone}`);
  await OtpLog.findOneAndUpdate(
    { phone, otp_code, verified: false },
    { verified: true },
    { sort: { created_at: -1 } }
  );

  return true;
};

module.exports = { sendOTP, verifyOTP };
