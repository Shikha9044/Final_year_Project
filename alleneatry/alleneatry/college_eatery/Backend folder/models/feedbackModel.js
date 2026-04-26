import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  itemId: { type: String },
  itemName: { type: String },
  itemImage: { type: String },
  itemCategory: { type: String },
  rating: { type: Number, required: true },
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
