import Feedback from '../models/feedbackModel.js';

// POST /api/feedback
export const createFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment, isAdmin } = req.body;
    if (!orderId || !rating) return res.status(400).json({ success: false, message: 'Order and rating required' });
    let user = null;
    if (req.user && req.user.id) user = req.user.id;
    if (req.user && req.user.email) user = req.user.email;
    // Accept isAdmin from body for admin feedback
    const fb = new Feedback({ orderId, rating, comment, user, isAdmin: !!isAdmin });
    await fb.save();
    res.json({ success: true, message: 'Feedback submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving feedback' });
  }
};

// GET /api/feedback (admin)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching feedback' });
  }
};
