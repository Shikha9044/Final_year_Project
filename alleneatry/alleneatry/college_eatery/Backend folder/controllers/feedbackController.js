import Feedback from '../models/feedbackModel.js';
import orderModel from '../models/orderModel.js';

const normalizeOptionalRating = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) return null;
  return parsed;
};

// POST /api/feedback
export const createFeedback = async (req, res) => {
  try {
    const {
      orderId,
      itemId,
      itemName,
      itemImage,
      itemCategory,
      rating,
      tasteRating,
      cleanlinessRating,
      waitingTimeRating,
      comment,
      isAdmin,
      feedbackScope
    } = req.body;
    const normalizedRating = Number(rating);
    const normalizedTaste = normalizeOptionalRating(tasteRating);
    const normalizedCleanliness = normalizeOptionalRating(cleanlinessRating);
    const normalizedWaiting = normalizeOptionalRating(waitingTimeRating);

    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Order and rating required' });
    }

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    if (normalizedTaste === null || normalizedCleanliness === null || normalizedWaiting === null) {
      return res.status(400).json({ success: false, message: 'All optional ratings must be between 1 and 5' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const order = await orderModel.findOne({ _id: orderId, userId }).select('items');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this user' });
    }

    if (itemId) {
      const itemFound = (order.items || []).some((item) => {
        const orderItemId = item?.foodId?._id ? String(item.foodId._id) : String(item.foodId);
        return orderItemId === String(itemId);
      });
      if (!itemFound) {
        return res.status(400).json({ success: false, message: 'Selected food item is not part of this order' });
      }
    }

    const user = req.user?.id || req.user?.email || null;

    const normalizedScope = feedbackScope === 'order' || !itemId ? 'order' : 'item';

    // Accept item-level feedback when item details are provided, while keeping legacy order-level feedback working.
    const fb = new Feedback({
      orderId,
      feedbackScope: normalizedScope,
      itemId,
      itemName,
      itemImage,
      itemCategory,
      rating: normalizedRating,
      tasteRating: normalizedTaste,
      cleanlinessRating: normalizedCleanliness,
      waitingTimeRating: normalizedWaiting,
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

// GET /api/feedback/item-ratings/public
export const getPublicItemRatings = async (req, res) => {
  try {
    const ratings = await Feedback.aggregate([
      {
        $match: {
          itemId: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$itemId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const itemRatings = {};
    for (const row of ratings) {
      itemRatings[String(row._id)] = {
        rating: Number((row.avgRating || 0).toFixed(1)),
        count: row.count || 0
      };
    }

    res.json({ success: true, itemRatings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching item ratings' });
  }
};
