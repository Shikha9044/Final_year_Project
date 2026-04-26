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

// Get personalized food recommendations from previous orders
const getUserRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 10);

        const recentOrders = await orderModel.find({
            userId,
            status: { $ne: 'cancelled' }
        })
            .sort({ createdAt: -1 })
            .limit(30)
            .select('items createdAt');

        const orderedItemMap = new Map();
        const categoryAffinity = new Map();

        for (const order of recentOrders) {
            for (const item of order.items || []) {
                const itemId = item?.foodId?.toString();
                if (!itemId) continue;

                const existing = orderedItemMap.get(itemId) || {
                    _id: itemId,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    category: item.category,
                    quantity: 0,
                    orderCount: 0,
                    latestOrderedAt: order.createdAt
                };

                existing.quantity += item.quantity || 1;
                existing.orderCount += 1;
                if (!existing.latestOrderedAt || new Date(order.createdAt) > new Date(existing.latestOrderedAt)) {
                    existing.latestOrderedAt = order.createdAt;
                }

                orderedItemMap.set(itemId, existing);

                if (item.category) {
                    const current = categoryAffinity.get(item.category) || 0;
                    categoryAffinity.set(item.category, current + (item.quantity || 1));
                }
            }
        }

        const orderedItems = Array.from(orderedItemMap.values());
        const orderedIds = orderedItems.map((item) => item._id);

        const scoredFavorites = orderedItems
            .map((item) => {
                const categoryScore = categoryAffinity.get(item.category) || 0;
                const daysSinceLastOrder = item.latestOrderedAt
                    ? Math.max(0, (Date.now() - new Date(item.latestOrderedAt).getTime()) / (1000 * 60 * 60 * 24))
                    : 30;

                const rawScore = 70 + (item.quantity * 3) + (item.orderCount * 2) + (categoryScore * 0.6) - (daysSinceLastOrder * 0.5);
                const matchScore = Math.max(72, Math.min(99, Math.round(rawScore)));

                return {
                    _id: item._id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    category: item.category,
                    matchScore,
                    source: 'history',
                    reason: 'Based on your previous orders'
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);

        const topCategories = Array.from(categoryAffinity.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);

        let categorySuggestions = [];
        if (topCategories.length > 0) {
            const candidates = await foodModel.find({
                category: { $in: topCategories },
                _id: { $nin: orderedIds },
                stock: { $gt: 0 }
            }).select('name image price category');

            categorySuggestions = candidates
                .map((item) => {
                    const affinity = categoryAffinity.get(item.category) || 0;
                    const rawScore = 58 + (affinity * 1.8);
                    return {
                        _id: item._id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        category: item.category,
                        matchScore: Math.max(60, Math.min(95, Math.round(rawScore))),
                        source: 'category',
                        reason: `Popular in your favorite ${item.category} category`
                    };
                })
                .sort((a, b) => b.matchScore - a.matchScore);
        }

        const popularFallback = await orderModel.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.foodId',
                    totalQty: { $sum: '$items.quantity' },
                    name: { $first: '$items.name' },
                    image: { $first: '$items.image' },
                    price: { $first: '$items.price' },
                    category: { $first: '$items.category' }
                }
            },
            { $sort: { totalQty: -1 } },
            { $limit: 20 }
        ]);

        const popularSuggestions = popularFallback
            .filter((item) => !orderedIds.includes(item._id?.toString()))
            .map((item) => ({
                _id: item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                category: item.category,
                matchScore: Math.max(55, Math.min(88, Math.round(52 + (item.totalQty * 0.8)))),
                source: 'popular',
                reason: 'Trending with other students'
            }));

        const merged = [...scoredFavorites, ...categorySuggestions, ...popularSuggestions];
        const uniqueRecommendations = [];
        const seen = new Set();

        for (const item of merged) {
            const itemId = item?._id?.toString();
            if (!itemId || seen.has(itemId)) continue;
            seen.add(itemId);
            uniqueRecommendations.push(item);
            if (uniqueRecommendations.length >= limit) break;
        }

        res.json({
            success: true,
            recommendations: uniqueRecommendations,
            basedOnHistory: recentOrders.length > 0
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ success: false, message: 'Error fetching recommendations' });
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

// Get total ordered quantity by item (Admin only)
const getItemOrderStats = async (req, res) => {
    try {
        const itemStats = await orderModel.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    totalOrders: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalOrders: -1, _id: 1 } }
        ]);

        res.json({
            success: true,
            itemStats: itemStats.map((item) => ({
                name: item._id,
                totalOrders: item.totalOrders
            }))
        });
    } catch (error) {
        console.error("Get item order stats error:", error);
        res.status(500).json({ success: false, message: "Error fetching item order statistics" });
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
    getUserRecommendations,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    getOrderStats,
    getItemOrderStats,
    getOrderByIdAdmin
};