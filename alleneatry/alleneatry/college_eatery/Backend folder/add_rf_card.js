// Usage: node add_rf_card.js
// Make sure to set your MongoDB connection string in the MONGO_URI variable below.

import mongoose from "mongoose";
import rfCardModel from "./models/rfCardModel.js";

const MONGO_URI = "mongodb://localhost:27017/yourdbname"; // <-- Change this to your MongoDB URI

const cardsToAdd = [
  { cardNumber: "1234567890123456", balance: 500, ownerName: "John Doe" },
  { cardNumber: "9876543210987654", balance: 1000, ownerName: "Jane Smith" },
  { cardNumber: "5555666677778888", balance: 750, ownerName: "Alice Johnson" }
  // Add more cards here
];

async function addMultipleRFCards(cards) {
  await mongoose.connect(MONGO_URI);
  for (const cardData of cards) {
    try {
      const card = new rfCardModel({ ...cardData, lastUsed: null });
      await card.save();
      console.log("RF Card added:", card.cardNumber);
    } catch (err) {
      console.error(`Error adding card ${cardData.cardNumber}:`, err.message);
    }
  }
  await mongoose.disconnect();
}

addMultipleRFCards(cardsToAdd).catch(console.error);
