import express from 'express';
import { 
  handleSendMeetingInvite, 
  handleSendInstantInvite, 
  handleSendWelcomeEmail 
} from '../controllers/emailController.js';

const router = express.Router();

router.post('/send-invite', handleSendMeetingInvite);
router.post('/send-instant-invite', handleSendInstantInvite);
router.post('/send-welcome', handleSendWelcomeEmail);

export default router;
