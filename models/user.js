const db = require('../db');
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { SECRET_KEY, BCRYPT_WORK_ROUNDS, OPTIONS } = require('../config');

/** User class for message.ly */

/** User of the site. */

class User {
  // Not sure if we need to make a constructor yet
  // constructor({
  //   username,
  //   password,
  //   first_name,
  //   last_name,
  //   phone,
  //   email,
  //   join_at,
  //   last_login_at
  // }) {
  //   this.username = username;
  //   this.password = password;
  //   this.first_name = first_name;
  //   this.last_name = last_name;
  //   this.phone = phone;
  //   this.email = email;
  //   this.join_at =
  // }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try {
      //hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // const result = await db.query(`SELECT * from users`)
      const usernameCheckInDB = await db.query(
        `
      SELECT username
      FROM users
      WHERE username=$1`,
        [username]
      );

      if (usernameCheckInDB.rows.length === 0) {
        const result = await db.query(
          `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
          [username, hashedPassword, first_name, last_name, phone]
        );

        return result.rows[0];
      } else {
        throw new Error('Username taken');
      }
    } catch (err) {
      return err;
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const result = await db.query(
        'SELECT password FROM users WHERE username = $1',
        [username]
      );

      let user = result.rows[0];

      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          let token = await jwt.sign({ username }, SECRET_KEY, OPTIONS);
          await User.updateLoginTimestamp(username);
          return { token };
        }
      }
      return { message: 'Invalid user / password' };
    } catch (err) {
      throw new Error('no user');
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1`,
      [username]
    );
    console.log('timestamp updated');
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    // check if they are authenticated
    try {
      const result = await db.query(
        ` SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`,
        [username]
      );

      if (result.rows.length === 0) {
        throw new Error('No users found');
      }
      return result.rows[0];
    } catch (err) {
      return err;
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      const result = await db.query(
        `SELECT messages.id, messages.to_username, messages.body, messages.sent_at, messages.read_at, 
          users.username, users.first_name, users.last_name, users.phone
        FROM messages
        JOIN users ON messages.to_username = users.username
        WHERE from_username = $1`,
        [username]
      );
      if (result.rows.length === 0) {
        throw new Error('No messages found');
      }
      return result.rows;
    } catch (err) {
      return err;
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      console.log(username);
      const result = await db.query(
        `SELECT messages.id, messages.from_username, messages.body, messages.sent_at, messages.read_at, 
          users.username, users.first_name, users.last_name, users.phone
        FROM messages
        JOIN users ON messages.from_username = users.username
        WHERE to_username = $1`,
        [username]
      );
      console.log(result);
      if (result.rows.length === 0) {
        throw new Error('No messages found');
      }
      return result.rows;
    } catch (err) {
      return err;
    }
  }
}

module.exports = User;
