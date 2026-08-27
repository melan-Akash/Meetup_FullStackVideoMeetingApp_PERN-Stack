-- PostgreSQL Database Schema for MeetUp Application

-- Users Table
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

-- Meetings Table
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

-- Meeting Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    meeting_id VARCHAR(50) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    CONSTRAINT unique_meeting_user UNIQUE (meeting_id, user_id)
);

-- Meeting Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    meeting_id VARCHAR(50) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
