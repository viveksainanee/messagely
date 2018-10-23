const express = require('express');
const User = require('../models/user');
const Message = require('../models/message');
const { ensureLoggedIn } = require("../middleware/auth")

router = express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
  let { username, password } = req.body;
  let token = await User.authenticate(username, password);
  await User.updateLoginTimestamp(username);
  return res.json(token);
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

//  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE1NDAzMTQ2MDksImV4cCI6MTU0MDMxODIwOX0.XX21PITt2dDceSDWErstTqpifti8kLufY6FPlP2h_As"
router.post('/register', async (req, res, next) => {
  let { username, password, first_name, last_name, phone } = req.body;

  let user = await User.register({
    username,
    password,
    first_name,
    last_name,
    phone
  });
  console.log(user);

  if (user.username) {
    let token = await User.authenticate(username, password);
    return res.json(token);
  } else {
    //user is an error in this
    console.log(user);
    process.exit(1);
  }
});

module.exports = router;
