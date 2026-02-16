import express from 'express';
import { createFeedback, getAllFeedback } from '../controllers/feedbackController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// User or admin submits feedback (requires auth)
router.post('/submit', authMiddleware, createFeedback);
// Admin gets all feedback
router.get('/', adminAuth, getAllFeedback);

export default router;
