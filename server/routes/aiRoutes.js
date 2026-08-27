import express from 'express';
import { 
  handleGenerateSummary, 
  handleAICoPilot, 
  handleTranslate, 
  handleEmailSummary 
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/summary', handleGenerateSummary);
router.post('/copilot', handleAICoPilot);
router.post('/translate', handleTranslate);
router.post('/email-summary', handleEmailSummary);

export default router;
