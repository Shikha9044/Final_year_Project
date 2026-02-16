import mongoose from "mongoose";

 const foodSchema = new mongoose.Schema({
     name: { type: String, required: true },
     description: { type: String },
     price: { type: Number, required: true },
     image: { type: String },
     category: { type: String, required: true },
     todaysMenu: { type: Boolean, default: false },
     stock: { type: Number, required: true, default: 0 }, // Stock field for inventory
     lowStockThreshold: { type: Number, default: 5 } // Optional: threshold for low stock alert
 })

 const foodModel=mongoose.models.food || mongoose.model("food",foodSchema);

 export default foodModel;