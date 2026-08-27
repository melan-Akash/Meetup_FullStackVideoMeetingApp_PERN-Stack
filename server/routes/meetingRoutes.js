import express from 'express';
import { 
  createMeeting, 
  scheduleMeeting,
  getUpcomingMeetings,
  joinMeetingLog, 
  endMeetingSession, 
  getUserSessions 
} from '../controllers/meetingController.js';

const router = express.Router();

/**
 * Route: POST /api/meetings/create
 * Purpose: Persists a newly created instant conference room ID and title to PostgreSQL.
 */
router.post('/create', createMeeting);

/**
 * Route: POST /api/meetings/schedule
 * Purpose: Schedules a future conference room with date, time, link, and invitation generator.
 */
router.post('/schedule', scheduleMeeting);

/**
 * Route: GET /api/meetings/upcoming/:userID
 * Purpose: Retrieves upcoming scheduled meetings for a specific user.
 */
router.get('/upcoming/:userID', getUpcomingMeetings);

/**
 * Route: POST /api/meetings/join-log
 * Purpose: Records participant session entry events to track who joined the meeting.
 */
router.post('/join-log', joinMeetingLog);

/**
 * Route: PUT /api/meetings/:id/end
 * Purpose: Updates the meeting room state status to 'ended' in the database.
 */
router.put('/:id/end', endMeetingSession);

/**
 * Route: GET /api/meetings/user/:userID
 * Purpose: Compiles a detailed list of past sessions (including rosters and chats) for a user.
 */
router.get('/user/:userID', getUserSessions);

export default router;