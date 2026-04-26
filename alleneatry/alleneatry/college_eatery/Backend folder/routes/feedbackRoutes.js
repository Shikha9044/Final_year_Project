import express from 'express';
import { createFeedback, getAllFeedback, getMyFeedbacks } from '../controllers/feedbackController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// User or admin submits feedback (requires auth)
router.post('/submit', authMiddleware, createFeedback);
// Logged in user can fetch their own feedback history
router.get('/mine', authMiddleware, getMyFeedbacks);
// Admin gets all feedback
router.get('/', adminAuth, getAllFeedback);

export default router;
