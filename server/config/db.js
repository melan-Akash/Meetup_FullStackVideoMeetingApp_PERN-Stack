import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import pkg from 'pg';
const { Pool } = pkg;
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

let rawUrl = (process.env.DATABASE_URL || '').replace(/['"]/g, '').trim();

if (!rawUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Neon HTTP query instance
export const sql = neon(rawUrl);

// PostgreSQL Connection Pool instance
export const pool = new Pool({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false }
});

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
        image_url TEXT,
        nickname VARCHAR(100),
        bio TEXT,
        plan VARCHAR(20) DEFAULT 'Free',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure columns exist if table already existed
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    `);

    // 2. Meetings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) DEFAULT 'Instant Meeting',
        host_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        scheduled_at TIMESTAMPTZ,
        duration INT DEFAULT 30,
        description TEXT,
        ended_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Ensure schedule columns exist if table already existed
    await pool.query(`
      ALTER TABLE meetings ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
      ALTER TABLE meetings ADD COLUMN IF NOT EXISTS duration INT DEFAULT 30;
      ALTER TABLE meetings ADD COLUMN IF NOT EXISTS description TEXT;
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

    console.log("Database initialized successfully with IPv4 connection");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export default pool;