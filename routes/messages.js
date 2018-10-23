const express = require('express');
const User = require('../models/user');
const Message = require('../models/message');
const { ensureLoggedIn } = require('../middleware/auth.js');
const {
  fromPhone,
  accountSid,
  authToken,
  SECRET_KEY,
  toPhone
} = require('../config');

router = express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async (req, res, next) => {
  let id = req.params.id;
  let message = await Message.get(id);

  return res.json(message);
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) => {
  let { from_username, to_username, body } = req.body;
  let message = await Message.create({ from_username, to_username, body });
  return res.json(message);
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
  try {
    let id = req.params.id;
    let message = await Message.get(id);

    console.log(req.username);
    console.log(message);

    if (req.username === message.message.to_username) {
      await Message.markRead(id);
      return res.json('Marked as read');
    } else {
      throw new Error('not authorized to see tmessage');
    }
  } catch (err) {
    return next(err);
  }
});

router.post('/send', async (req, res, next) => {
  try {
    const body = req.body.body;

    await Message.sendSmsMessage(fromPhone, toPhone, body);

    return res.json('message sent!');
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
