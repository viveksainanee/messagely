/** Common config for message.ly */

// read .env files and make environmental variables

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'secret';
const BCRYPT_WORK_ROUNDS = 10;
const authToken = process.env.authToken;
const accountSid = process.env.accountSid;
const toPhone = process.env.toPhone;

const fromPhone = process.env.fromPhone;
const OPTIONS = { expiresIn: 60 * 60 }; // 1 hour;

module.exports = {
  SECRET_KEY,
  BCRYPT_WORK_ROUNDS,
  OPTIONS,
  fromPhone,
  authToken,
  accountSid,
  toPhone
};
