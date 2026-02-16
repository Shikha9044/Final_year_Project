import mongoose from "mongoose";

const rfCardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  ownerName: String,
  lastUsed: Date
});

const rfCardModel = mongoose.models.rfcard || mongoose.model("rfcard", rfCardSchema);
export default rfCardModel;
