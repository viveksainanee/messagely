const express = require('express');
const User = require('../models/user');
const Message = require('../models/message');
const { ensureLoggedIn } = require("../middleware/auth")

router = express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/',ensureLoggedIn,async (req, res, next) => {
  const result = await User.all();
  return res.json(result);
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', async (req, res, next) => {
  let username = req.params.username;
  let user = await User.get(username);
  return res.json(user);
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', async (req, res, next) => {
  let username = req.params.username;
  console.log(username);
  let messages = await User.messagesTo(username);

  let resultArr = [];

  for (let i = 0; i < messages.length; i++) {
    let { from_username, first_name, last_name, phone } = messages[i];
    let { id, body, sent_at, read_at } = messages[i];
    let result = {
      id,
      body,
      sent_at,
      read_at,
      from_user: { username: from_username, first_name, last_name, phone }
    };
    resultArr.push(result);
  }
  return res.json(resultArr);
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', async (req, res, next) => {
  let username = req.params.username;
  let messages = await User.messagesFrom(username);

  let resultArr = [];

  for (let i = 0; i < messages.length; i++) {
    let { to_username, first_name, last_name, phone } = messages[i];
    let { id, body, sent_at, read_at } = messages[i];
    let result = {
      id,
      body,
      sent_at,
      read_at,
      to_user: { username: to_username, first_name, last_name, phone }
    };
    resultArr.push(result);
  }
  return res.json(resultArr);
});

module.exports = router;
