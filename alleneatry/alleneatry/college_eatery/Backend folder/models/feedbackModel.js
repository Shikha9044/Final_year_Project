import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  feedbackScope: {
    type: String,
    enum: ['item', 'order'],
    default: 'item'
  },
  itemId: { type: String },
  itemName: { type: String },
  itemImage: { type: String },
  itemCategory: { type: String },
  rating: { type: Number, required: true },
  tasteRating: { type: Number, min: 1, max: 5 },
  cleanlinessRating: { type: Number, min: 1, max: 5 },
  waitingTimeRating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  user: { type: String }, // user email or id
  isAdmin: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
export default Feedback;
