import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'meetup_super_secret_jwt_key_2026';

/**
 * Generates a signed JWT authentication token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.fullname },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Handles new user registration with hashed password & JWT token
 * Route: POST /api/auth/register
 */
export const handleRegister = async (req, res) => {
  const { fullName, email, password, nickname, imageUrl } = req.body;
  const displayName = fullName || nickname || 'User';

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [cleanEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists. Please sign in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const insertResult = await pool.query(
      "INSERT INTO users (id, fullname, email, password, nickname, image_url, plan) VALUES ($1, $2, $3, $4, $5, $6, 'Free') RETURNING id, fullname, email, plan, nickname, image_url, created_at",
      [userId, displayName, cleanEmail, hashedPassword, nickname || displayName, imageUrl || null]
    );

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullname,
        name: newUser.fullname,
        email: newUser.email,
        plan: newUser.plan,
        nickname: newUser.nickname,
        imageUrl: newUser.image_url
      }
    });
  } catch (err) {
    console.error("Error during registration in db:", err);
    return res.status(500).json({ error: "Internal server error during registration" });
  }
};

/**
 * Handles user login with password verification & JWT token
 * Route: POST /api/auth/login
 */
export const handleLogin = async (req, res) => {
  const { email, password, id, fullName } = req.body;

  if (!password && (id || email)) {
    return handleGuestLogin(req, res);
  }

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "No account found with this email. Please register." });
    }

    const user = result.rows[0];

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullname,
        name: user.fullname,
        email: user.email,
        plan: user.plan,
        nickname: user.nickname,
        imageUrl: user.image_url,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error("Error inside login controller:", err);
    return res.status(500).json({ error: "Internal database transaction failed" });
  }
};

/**
 * Handles guest user profile sync
 */
export const handleGuestLogin = async (req, res) => {
  const { id, fullName, email, imageUrl } = req.body;
  const userId = id || `guest_${Date.now()}`;
  const userName = fullName || 'Great Stack';
  const userEmail = email || `${userName.toLowerCase().replace(/\s+/g, '')}@guest.local`;

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE id = $1 OR LOWER(email) = $2", [userId, userEmail.toLowerCase()]);
    if (userCheck.rows.length > 0) {
      const existing = userCheck.rows[0];
      const token = generateToken(existing);
      return res.status(200).json({
        token,
        ...existing,
        fullName: existing.fullname,
        name: existing.fullname,
        imageUrl: existing.image_url
      });
    }

    const result = await pool.query(
      "INSERT INTO users (id, fullname, email, image_url, plan) VALUES ($1, $2, $3, $4, 'Free') RETURNING *",
      [userId, userName, userEmail, imageUrl || null]
    );
    const created = result.rows[0];
    const token = generateToken(created);

    return res.status(201).json({
      token,
      ...created,
      fullName: created.fullname,
      name: created.fullname,
      imageUrl: created.image_url
    });
  } catch (err) {
    console.error("Error inside guest login controller:", err);
    return res.status(500).json({ error: "Internal database transaction failed" });
  }
};

/**
 * Updates User Profile with Cloudinary Avatar, Nickname, Bio
 * Route: PUT /api/auth/profile
 */
export const handleUpdateProfile = async (req, res) => {
  const { id, fullName, nickname, imageUrl, bio } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
       SET fullname = COALESCE($1, fullname),
           nickname = COALESCE($2, nickname),
           image_url = COALESCE($3, image_url),
           bio = COALESCE($4, bio),
           updated_at = NOW()
       WHERE id = $5 
       RETURNING id, fullname, email, plan, nickname, image_url, bio`,
      [fullName, nickname, imageUrl, bio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = result.rows[0];
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updated.id,
        fullName: updated.fullname,
        name: updated.fullname,
        email: updated.email,
        plan: updated.plan,
        nickname: updated.nickname,
        imageUrl: updated.image_url,
        bio: updated.bio
      }
    });
  } catch (err) {
    console.error("Error updating profile in db:", err);
    return res.status(500).json({ error: "Failed to update profile", details: err.message });
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

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error upgrading plan tier in db:", err);
    return res.status(500).json({ error: "Database transaction failed" });
  }
};

/**
 * Returns currently authenticated user using JWT
 * Route: GET /api/auth/me
 */
export const handleGetCurrentUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query("SELECT id, fullname, email, plan, nickname, image_url, bio FROM users WHERE id = $1", [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = result.rows[0];
    return res.status(200).json({
      id: user.id,
      fullName: user.fullname,
      name: user.fullname,
      email: user.email,
      plan: user.plan,
      nickname: user.nickname,
      imageUrl: user.image_url,
      bio: user.bio
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};