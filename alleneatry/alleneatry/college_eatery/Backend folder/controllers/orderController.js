import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// Create new order
const createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, specialInstructions, paymentMethod } = req.body || {};
        const userId = req.user.id;

        console.log('CreateOrder request from user:', userId);
        console.log('CreateOrder body:', JSON.stringify(req.body));

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Order must contain at least one item" });
        }

        // Validate and enrich items with food details
        const enrichedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const food = await foodModel.findById(item.foodId);
            if (!food) {
                return res.status(400).json({ success: false, message: `Food item ${item.foodId} not found` });
            }
            // Check stock
            if (typeof food.stock !== 'number' || food.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${food.name}` });
            }

            const enrichedItem = {
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity,
                image: food.image,
                category: food.category
            };

            enrichedItems.push(enrichedItem);
            totalAmount += food.price * item.quantity;
        }

        // Deduct stock after all checks pass
        for (const item of items) {
            await foodModel.findByIdAndUpdate(item.foodId, { $inc: { stock: -item.quantity } });
        }

        // Format delivery address to match the model structure (use safe defaults)
        const addr = deliveryAddress || {};
        const formattedDeliveryAddress = {
            name: `${addr.firstName || ''} ${addr.lastName || ''}`.trim(),
            phone: addr.phone || '',
            address: `${addr.street || ''}${addr.city ? ', ' + addr.city : ''}${addr.state ? ', ' + addr.state : ''}${addr.zipcode ? ' ' + addr.zipcode : ''}${addr.country ? ', ' + addr.country : ''}`.replace(/^,\s*/, ''),
            landmark: addr.landmark || '',
            pincode: addr.zipcode || ''
        };

        // Create order

        const order = new orderModel({
            userId,
            items: enrichedItems,
            totalAmount,
            deliveryAddress: formattedDeliveryAddress,
            specialInstructions: specialInstructions || '',
            paymentMethod: paymentMethod || 'cash',
            isTodaySpecial: enrichedItems.some(item => item.isTodaySpecial),
            status: 'confirmed' // auto-confirm order on creation
        });

        // Generate pickup token
        order.tokenNumber = Math.floor(1000 + Math.random() * 9000).toString();
        await order.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                status: order.status,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                tokenNumber: order.tokenNumber
            }
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ success: false, message: "Error creating order" });
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { userId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await orderModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('items.foodId', 'name image category');

        const total = await orderModel.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await orderModel.findOne({ _id: orderId, userId })
            .populate('items.foodId', 'name image category description');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, order });

    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({ success: false, message: "Error fetching order" });
    }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, estimatedDeliveryTime } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update status and delivery time
        if (status) {
            order.status = status;
            
            // Set actual delivery time when status is 'delivered'
            if (status === 'delivered') {
                order.actualDeliveryTime = new Date();
            }
        }

        if (estimatedDeliveryTime) {
            order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
        }

        await order.save();

        res.json({
            success: true,
            message: "Order status updated successfully",
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                actualDeliveryTime: order.actualDeliveryTime
            }
        });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ success: false, message: "Error updating order status" });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await orderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if order can be cancelled
        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: "Order cancelled successfully",
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status
            }
        });

    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({ success: false, message: "Error cancelling order" });
    }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, date } = req.query;

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt = { $gte: startDate, $lt: endDate };
        }

        const orders = await orderModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email')
            .populate('items.foodId', 'name image category');

        const total = await orderModel.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// Get order statistics (Admin only)
const getOrderStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayOrders = await orderModel.countDocuments({
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        const todayRevenue = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lt: endOfDay },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);

        const pendingOrders = await orderModel.countDocuments({ status: 'pending' });
        const preparingOrders = await orderModel.countDocuments({ status: 'preparing' });

        res.json({
            success: true,
            stats: {
                todayOrders,
                todayRevenue: todayRevenue[0]?.total || 0,
                pendingOrders,
                preparingOrders
            }
        });

    } catch (error) {
        console.error("Get order stats error:", error);
        res.status(500).json({ success: false, message: "Error fetching order statistics" });
    }
};

// Get order by ID (Admin only)
const getOrderByIdAdmin = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderModel.findById(orderId)
            .populate('userId', 'name email phone')
            .populate('items.foodId', 'name image category description');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, order });

    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({ success: false, message: "Error fetching order" });
    }
};

export {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    getOrderStats,
    getOrderByIdAdmin
};