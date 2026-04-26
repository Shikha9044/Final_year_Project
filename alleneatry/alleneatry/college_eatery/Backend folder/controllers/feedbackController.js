import Feedback from '../models/feedbackModel.js';

// POST /api/feedback
export const createFeedback = async (req, res) => {
  try {
    const { orderId, itemId, itemName, itemImage, itemCategory, rating, comment, isAdmin } = req.body;
    const normalizedRating = Number(rating);

    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Order and rating required' });
    }

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    let user = null;
    if (req.user && req.user.id) user = req.user.id;
    if (req.user && req.user.email) user = req.user.email;

    // Accept item-level feedback when item details are provided, while keeping legacy order-level feedback working.
    const fb = new Feedback({
      orderId,
      itemId,
      itemName,
      itemImage,
      itemCategory,
      rating: normalizedRating,
      comment,
      user,
      isAdmin: !!isAdmin
    });
    await fb.save();
    res.json({ success: true, message: 'Feedback submitted', feedback: fb });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving feedback' });
  }
};

// GET /api/feedback/mine
export const getMyFeedbacks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const feedbacks = await Feedback.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching feedback' });
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
