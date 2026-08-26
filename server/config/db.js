import { Pool, neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

let rawUrl = process.env.DATABASE_URL || '';

// Clean connection string if it starts with "psql " or quotes
if (rawUrl.startsWith('psql ')) {
  rawUrl = rawUrl.replace(/^psql\s+['"]?/, '').replace(/['"]?$/, '');
}

if (!rawUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Neon HTTP query instance
export const sql = neon(rawUrl);

// Neon Connection Pool instance for pg pool.query compatibility
export const pool = new Pool({ connectionString: rawUrl });

// Initialize PostgreSQL database tables
export async function initDB() {
  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        image VARCHAR(500),
        plan VARCHAR(20) DEFAULT 'Free',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure password column exists if table already existed
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `);

    // 2. Meetings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) DEFAULT 'Instant Meeting',
        host_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        ended_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Participants Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        meeting_id VARCHAR(50) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE ON UPDATE CASCADE,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        left_at TIMESTAMPTZ,
        CONSTRAINT unique_meeting_user UNIQUE (meeting_id, user_id)
      );
    `);

    // 4. Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        meeting_id VARCHAR(50) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE ON UPDATE CASCADE,
        sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
        sender_name VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export default pool;