import express from "express";
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    getOrderStats,
    getOrderByIdAdmin
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";

const orderRouter = express.Router();

// User routes (require authentication)
// Keep existing create route and add `/place` as an alias for frontend compatibility
orderRouter.post("/create", authMiddleware, createOrder);
orderRouter.post("/place", authMiddleware, createOrder);
orderRouter.get("/user-orders", authMiddleware, getUserOrders);
orderRouter.get("/:orderId", authMiddleware, getOrderById);
orderRouter.post("/:orderId/cancel", authMiddleware, cancelOrder);

// Admin routes (require admin authentication)
orderRouter.get("/admin/all", adminAuthMiddleware, getAllOrders);
orderRouter.get("/admin/stats", adminAuthMiddleware, getOrderStats);
orderRouter.get("/admin/:orderId", adminAuthMiddleware, getOrderByIdAdmin);
orderRouter.put("/admin/:orderId/status", adminAuthMiddleware, updateOrderStatus);

export default orderRouter;
