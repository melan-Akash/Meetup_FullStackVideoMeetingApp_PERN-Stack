import pool from '../config/db.js';

/**
 * Persists a newly created instant meeting room session to the database
 * Route: POST /api/meetings/create
 */
export const createMeeting = async (req, res) => {
  const { meetingID, title, description, hostID } = req.body;

  if (!meetingID || !hostID) {
    return res.status(400).json({ error: "Missing meetingID or hostID details" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO meetings (id, title, description, host_id, status) VALUES ($1, $2, $3, $4, 'active') RETURNING *",
      [meetingID, title || 'Instant Meeting', description || null, hostID]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting meeting to db:", err);
    res.status(500).json({ error: "Failed to persist meeting room session" });
  }
};

/**
 * Schedules a future meeting room session with link and invitation generator
 * Route: POST /api/meetings/schedule
 */
export const scheduleMeeting = async (req, res) => {
  const { title, scheduledAt, duration = 30, description, hostID } = req.body;

  if (!scheduledAt || !hostID) {
    return res.status(400).json({ error: "Missing required fields (scheduledAt, hostID)" });
  }

  const part = () => Math.random().toString(36).substring(2, 5);
  const meetingID = `${part()}-${part()}-${part()}`;

  try {
    const result = await pool.query(
      `INSERT INTO meetings (id, title, host_id, status, scheduled_at, duration, description) 
       VALUES ($1, $2, $3, 'scheduled', $4, $5, $6) 
       RETURNING *`,
      [
        meetingID, 
        title || 'Scheduled Meeting', 
        hostID, 
        scheduledAt, 
        parseInt(duration, 10) || 30, 
        description || null
      ]
    );

    const meeting = result.rows[0];
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    const meetingLink = `${clientURL}/meeting/${meetingID}`;

    const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const invitationText = `You are invited to MeetUp Video Conference!\n\nTopic: ${meeting.title}\nTime: ${formattedDate} (${meeting.duration || 30} mins)\n\nJoin Meeting Link:\n${meetingLink}\n\nMeeting ID: ${meetingID}`;

    return res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully",
      meeting,
      meetingLink,
      invitationText
    });
  } catch (err) {
    console.error("Error scheduling meeting in database:", err);
    return res.status(500).json({ error: "Failed to schedule meeting" });
  }
};

/**
 * Retrieves upcoming scheduled meetings for a specific user
 * Route: GET /api/meetings/upcoming/:userID
 */
export const getUpcomingMeetings = async (req, res) => {
  const { userID } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, u.fullname as host_name, u.email as host_email 
       FROM meetings m
       LEFT JOIN users u ON m.host_id = u.id
       WHERE m.host_id = $1 AND m.status = 'scheduled'
       ORDER BY m.scheduled_at ASC`,
      [userID]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching upcoming meetings:", err);
    return res.status(500).json({ error: "Failed to fetch upcoming meetings" });
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
    const meetingCheck = await pool.query("SELECT * FROM meetings WHERE id = $1", [meetingID]);
    if (meetingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Requested meeting session does not exist" });
    }

    if (meetingCheck.rows[0].status === 'scheduled') {
      await pool.query("UPDATE meetings SET status = 'active' WHERE id = $1", [meetingID]);
    }

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
      "UPDATE meetings SET status = 'ended', ended_at = NOW() WHERE id = $1 RETURNING *",
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
 * Deletes a meeting session permanently from the database
 * Route: DELETE /api/meetings/:id
 */
export const deleteMeetingSession = async (req, res) => {
  const { id } = req.params; // meetingID

  try {
    const result = await pool.query("DELETE FROM meetings WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Meeting session not found to delete" });
    }

    res.status(200).json({ success: true, message: "Meeting session deleted successfully" });
  } catch (err) {
    console.error("Error deleting meeting session from db:", err);
    res.status(500).json({ error: "Failed to delete meeting session" });
  }
};

/**
 * Compiles a user's entire meeting logs history (as participant or host)
 * Route: GET /api/meetings/user/:userID
 */
export const getUserSessions = async (req, res) => {
  const { userID } = req.params;

  try {
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

    for (let meeting of meetingsResult.rows) {
      const participantsResult = await pool.query(`
        SELECT u.id, u.fullname as name, u.email, p.joined_at 
        FROM participants p
        JOIN users u ON p.user_id = u.id
        WHERE p.meeting_id = $1
        ORDER BY p.joined_at ASC
      `, [meeting.id]);

      const messagesResult = await pool.query(`
        SELECT id, sender_id as "senderId", sender_name as "senderName", text, timestamp
        FROM messages 
        WHERE meeting_id = $1 
        ORDER BY timestamp ASC
      `, [meeting.id]);

      sessions.push({
        id: `session_${meeting.id}`,
        meetingID: meeting.id,
        title: meeting.title,
        status: meeting.status,
        scheduledAt: meeting.scheduled_at,
        duration: meeting.duration,
        description: meeting.description,
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