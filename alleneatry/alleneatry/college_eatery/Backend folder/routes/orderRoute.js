import { getOrderById } from "../controllers/orderController.js";

const orderRouter = express.Router();
orderRouter.post("/cancel/:orderId", authMiddleware, cancelOrder);
orderRouter.post("/place",authMiddleware,createOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userorders",authMiddleware,userOrders);
orderRouter.get('/list',listOrders);
orderRouter.post("/status",updateStatus);
// Get order by ID (for tracking)
orderRouter.get('/:orderId', authMiddleware, getOrderById);

export default orderRouter;