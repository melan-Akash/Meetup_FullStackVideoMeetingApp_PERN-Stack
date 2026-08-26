import pool from '../config/db.js';

/**
 * Handles creating or retrieving a guest user profile inside the database
 * Route: POST /api/auth/login
 */
export const handleGuestLogin = async (req, res) => {
  const { id, fullName, email } = req.body;

  if (!id || !fullName || !email) {
    return res.status(400).json({ error: "Missing required parameters (id, fullName, email)" });
  }

  try {
    // 1. Check if the guest user already exists in our Neon PostgreSQL database
    const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (userCheck.rows.length > 0) {
      return res.status(200).json(userCheck.rows[0]);
    }

    // 2. Insert new guest user if not already in the database
    const result = await pool.query(
      "INSERT INTO users (id, fullname, email, plan) VALUES ($1, $2, $3, 'Free') RETURNING *",
      [id, fullName, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inside guest login controller:", err);
    res.status(500).json({ error: "Internal database transaction failed" });
  }
};

/**
 * Handles upgrading the membership plan tier (Free to Premium/Pro)
 * Route: PUT /api/auth/upgrade
 */
export const handleUpgradePlan = async (req, res) => {
  const { id, plan } = req.body;

  if (!id || !plan) {
    return res.status(400).json({ error: "Missing user ID or target plan tier" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET plan = $1 WHERE id = $2 RETURNING *",
      [plan, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found to upgrade" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error upgrading plan tier in db:", err);
    res.status(500).json({ error: "Database transaction failed" });
  }
};