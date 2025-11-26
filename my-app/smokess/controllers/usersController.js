import db from "../db.js";
import bcrypt from "bcrypt";


// @desc Get all Users
// @route GET /api/Users

export const getUsers =  async (req, res,next) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');

     if(rows.length === 0){
            const error = new Error("No users Yet!");
            error.status = 404;
            return next(error);
        }

    res.status(200).json(rows);
  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(error);
  }
};




// @desc Initialize a default user with username "user" and hashed password "password"
// @route POST /api/Users

export async function initUser() {
  const userName = "user";
  const plainPassword = "password";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Check if user already exists
  const [rows] = await db.query("SELECT * FROM users WHERE userName = ?", [userName]);
  if (rows.length === 0) {
    await db.query(
      "INSERT INTO users (id, userName, password) VALUES (?, ?, ?)",
      [1 , userName, hashedPassword]
    );
    console.log('Default user "user" created.');
  } else {
    console.log('Default user "user" already exist');
  }
};

// @desc Update a user's userName and/or password
// @route PUT /api/Users/:id
export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { userName, password } = req.body;

  try {
    // Build update fields dynamically
    const fields = [];
    const values = [];

    if (userName) {
      fields.push("userName = ?");
      values.push(userName);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ msg: "No fields to update." });
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "User not found." });
    }

    res.status(200).json({ msg: "User updated successfully." });
  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(error);
  }
};