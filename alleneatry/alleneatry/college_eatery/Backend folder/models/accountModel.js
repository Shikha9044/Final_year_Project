import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const accountModel = mongoose.models.account || mongoose.model("account", accountSchema);
export default accountModel;
