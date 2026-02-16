import express from "express";
import {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    processOrderWithPayment
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/auth.js";

const paymentRouter = express.Router();

// Payment routes (require authentication)
paymentRouter.post("/create-intent", authMiddleware, createPaymentIntent);
paymentRouter.post("/confirm", authMiddleware, confirmPayment);
paymentRouter.get("/status/:paymentIntentId", authMiddleware, getPaymentStatus);
paymentRouter.post("/process-order", authMiddleware, processOrderWithPayment);

export default paymentRouter;

