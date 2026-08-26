import pool from '../config/db.js';

/**
 * Persists a newly created meeting room session to the database
 * Route: POST /api/meetings/create
 */
export const createMeeting = async (req, res) => {
  const { meetingID, title, hostID } = req.body;

  if (!meetingID || !hostID) {
    return res.status(400).json({ error: "Missing meetingID or hostID details" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO meetings (id, title, host_id, status) VALUES ($1, $2, $3, 'active') RETURNING *",
      [meetingID, title || 'Untitled Meeting', hostID]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting meeting to db:", err);
    res.status(500).json({ error: "Failed to persist meeting room session" });
  }
};

/**
 * Logs a user joining an active meeting room (prevents duplicate logs)
 * Route: POST /api/meetings/join-log
 */
export const joinMeetingLog = async (req, res) => {
  const { meetingID, userID } = req.body;

  if (!meetingID || !userID) {
    return res.status(400).json({ error: "Missing meetingID or userID keys" });
  }

  try {
    // 1. Check if the meeting room session exists first
    const meetingCheck = await pool.query("SELECT * FROM meetings WHERE id = $1", [meetingID]);
    if (meetingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Requested meeting session does not exist" });
    }

    // 2. Ingest participant log into database
    await pool.query(
      "INSERT INTO participants (meeting_id, user_id) VALUES ($1, $2) ON CONFLICT (meeting_id, user_id) DO NOTHING",
      [meetingID, userID]
    );
    res.status(200).json({ success: true, message: "User participant log recorded successfully" });
  } catch (err) {
    console.error("Error logging participant to db:", err);
    res.status(500).json({ error: "Internal logger persistence failure" });
  }
};

/**
 * Closes an active meeting session by setting its status to 'ended'
 * Route: PUT /api/meetings/:id/end
 */
export const endMeetingSession = async (req, res) => {
  const { id } = req.params; // meetingID

  try {
    const result = await pool.query(
      "UPDATE meetings SET status = 'ended' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Meeting room not found to terminate" });
    }

    res.status(200).json({ success: true, message: "Meeting session terminated successfully" });
  } catch (err) {
    console.error("Error updating meeting status in db:", err);
    res.status(500).json({ error: "Server failed to end meeting status" });
  }
};

/**
 * Compiles a user's entire meeting logs history (as participant or host)
 * combined with participant lists and full chat message records.
 * Route: GET /api/meetings/user/:userID
 */
export const getUserSessions = async (req, res) => {
  const { userID } = req.params;

  try {
    // 1. Retrieve all meetings where the user was either the host OR a participant
    const query = `
      SELECT DISTINCT m.*, u.fullname as host_name, u.email as host_email
      FROM meetings m
      LEFT JOIN users u ON m.host_id = u.id
      LEFT JOIN participants p ON m.id = p.meeting_id
      WHERE m.host_id = $1 OR p.user_id = $1
      ORDER BY m.created_at DESC
    `;
    const meetingsResult = await pool.query(query, [userID]);
    const sessions = [];

    // 2. Compile full logs for each meeting session found
    for (let meeting of meetingsResult.rows) {
      // Fetch participant lists for this meeting
      const participantsResult = await pool.query(`
        SELECT u.id, u.fullname as name, u.email, p.joined_at 
        FROM participants p
        JOIN users u ON p.user_id = u.id
        WHERE p.meeting_id = $1
        ORDER BY p.joined_at ASC
      `, [meeting.id]);

      // Fetch recorded chat messages for this meeting
      const messagesResult = await pool.query(`
        SELECT id, sender_id as "senderId", sender_name as "senderName", text, timestamp
        FROM messages 
        WHERE meeting_id = $1 
        ORDER BY timestamp ASC
      `, [meeting.id]);

      // Map properties to match client/src/assets/assets.js structures exactly
      sessions.push({
        id: `session_${meeting.id}`,
        meetingID: meeting.id,
        title: meeting.title,
        status: meeting.status,
        createdAt: meeting.created_at,
        host: { 
          id: meeting.host_id, 
          name: meeting.host_name, 
          email: meeting.host_email 
        },
        participants: participantsResult.rows.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          joinedAt: new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })),
        messages: messagesResult.rows
      });
    }

    res.status(200).json(sessions);
  } catch (err) {
    console.error("Error compiling user session lists from PostgreSQL:", err);
    res.status(500).json({ error: "Failed to assemble logs from database" });
  }
};