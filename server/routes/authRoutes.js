import express from 'express';
import { 
  handleRegister, 
  handleLogin, 
  handleUpgradePlan, 
  handleGetCurrentUser,
  handleUpdateProfile
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.put('/upgrade', handleUpgradePlan);
router.put('/profile', handleUpdateProfile);
router.get('/me', handleGetCurrentUser);

export default router;