import { pool } from "../config/database.js";

const userFields = "id, name, email, role, created_at";

export async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING ${userFields}
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

export async function findUserByEmailWithPassword(email) {
  const result = await pool.query(
    `
      SELECT id, name, email, password_hash, role, created_at
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    `
      SELECT ${userFields}
      FROM users
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}
