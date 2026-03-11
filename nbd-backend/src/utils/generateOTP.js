const crypto = require('crypto');

const generateOTP = (length = 6) => {
  const max = Math.pow(10, length);
  const randomNumber = crypto.randomInt(0, max);
  return String(randomNumber).padStart(length, '0');
};

module.exports = generateOTP;
