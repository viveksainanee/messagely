const db = require('../db');

/** Message class for message.ly */

/** Message on the site. */

class Message {
  /** register new message -- returns
   *    {id, from_username, to_username, body, sent_at}
   */

  static async create({ from_username, to_username, body }) {
    try {
      //check if the user exists
      const result = await db.query(
        'SELECT password FROM users WHERE username = $1',
        [to_username]
      );
      let user = result.rows[0];

      if (user) {
        // insert the message
        const result = await db.query(
          `INSERT INTO messages (from_username, to_username, body, sent_at)
        VALUES ($1, $2, $3, current_timestamp)
        RETURNING id, from_username, to_username, body, sent_at`,
          [from_username, to_username, body]
        );
        return res.json(result.rows[0]);
      }
    } catch (err) {
      return next(err);
    }
  }

  /** Update read_at for message */

  static async markRead(id) {
    // not sure if we need to have an error handler here yet
    const result = await db.query(
      `UPDATE messages
      SET read_at = current_timestamp
      WHERE id = $1`,
      [id]
    );
  }

  /** Get: get message by id
   *
   * returns {id, from_user, to_user, body, sent_at, read_at}
   *
   * both to_user and from_user = {username, first_name, last_name, phone}
   */

  static async get(id) {
    try {
      const fromUser = await db.query(
        `SELECT username, first_name, last_name, phone
      FROM messages
      JOIN users on messages.from_user = users.username
      WHERE id=$1`,
        [id]
      );

      const toUser = await db.query(
        `SELECT username, first_name, last_name, phone
      FROM messages
      JOIN users on messages.to_user = users.username
      WHERE id=$1`,
        [id]
      );

      const message = await db.query(
        `SELECT id, from_user, to_user, body, sent_at, read_at
      FROM messages
      WHERE id=$1`,
        [id]
      );

      return res.json({ message, from_user, to_user });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = Message;
