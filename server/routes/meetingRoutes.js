import express from 'express';
import { 
  createMeeting, 
  scheduleMeeting,
  getUpcomingMeetings,
  joinMeetingLog, 
  endMeetingSession, 
  deleteMeetingSession,
  getUserSessions 
} from '../controllers/meetingController.js';

const router = express.Router();

router.post('/create', createMeeting);
router.post('/schedule', scheduleMeeting);
router.get('/upcoming/:userID', getUpcomingMeetings);
router.post('/join-log', joinMeetingLog);
router.put('/:id/end', endMeetingSession);
router.delete('/:id', deleteMeetingSession);
router.get('/user/:userID', getUserSessions);

export default router;