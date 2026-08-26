import express from 'express';
import { 
  handleRegister, 
  handleLogin, 
  handleUpgradePlan,
  handleGetCurrentUser 
} from '../controllers/authController.js';

const router = express.Router();

/**
 * Route: POST /api/auth/register
 * Purpose: Registers a new user with password & issues JWT token.
 */
router.post('/register', handleRegister);

/**
 * Route: POST /api/auth/login
 * Purpose: Authenticates existing user with password & returns JWT token.
 */
router.post('/login', handleLogin);

/**
 * Route: PUT /api/auth/upgrade
 * Purpose: Upgrades a user's membership tier (e.g. Free to Premium).
 */
router.put('/upgrade', handleUpgradePlan);

/**
 * Route: GET /api/auth/me
 * Purpose: Retrieves current authenticated profile using JWT token.
 */
router.get('/me', handleGetCurrentUser);

export default router;