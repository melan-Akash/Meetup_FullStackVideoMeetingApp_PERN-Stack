import express from 'express';
import { handleGuestLogin, handleUpgradePlan } from '../controllers/authController.js';

const router = express.Router();

/**
 * Route: POST /api/auth/login
 * Purpose: Registers or retrieves a guest user profile using a custom Nickname.
 */
router.post('/login', handleGuestLogin);

/**
 * Route: PUT /api/auth/upgrade
 * Purpose: Upgrades a guest user's membership tier (e.g., Free to Premium).
 */
router.put('/upgrade', handleUpgradePlan);

export default router;