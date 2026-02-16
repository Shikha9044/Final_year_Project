import Stripe from 'stripe';
import orderModel from '../models/orderModel.js';
import foodModel from '../models/foodModel.js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');

// Create payment intent
const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'inr', orderId } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid amount" 
            });
        }

        // Verify order exists and belongs to user
        if (orderId) {
            const order = await orderModel.findOne({ _id: orderId, userId });
            if (!order) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Order not found" 
                });
            }
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to smallest currency unit
            currency: currency,
            metadata: {
                userId: userId,
                orderId: orderId || 'pending'
            }
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating payment intent" 
        });
    }
};

// Confirm payment
const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId, orderId } = req.body;
        const userId = req.user.id;

        if (!paymentIntentId) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment intent ID is required" 
            });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Update order payment status if orderId is provided
            if (orderId) {
                const order = await orderModel.findOne({ _id: orderId, userId });
                if (order) {
                    order.paymentStatus = 'completed';
                    // If paymentIntent is for rfcard, set accordingly
                    order.paymentMethod = req.body.paymentType === 'rfcard' ? 'rfcard' : 'card';
                    await order.save();
                }
            }

            res.json({
                success: true,
                message: "Payment confirmed successfully",
                paymentStatus: paymentIntent.status
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Payment not completed",
                paymentStatus: paymentIntent.status
            });
        }

    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error confirming payment" 
        });
    }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.params;

        if (!paymentIntentId) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment intent ID is required" 
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.json({
            success: true,
            paymentStatus: paymentIntent.status,
            amount: paymentIntent.amount / 100, // Convert from smallest unit
            currency: paymentIntent.currency
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error retrieving payment status" 
        });
    }
};

// Process order with payment
const processOrderWithPayment = async (req, res) => {
    try {
        const { items, deliveryAddress, specialInstructions, paymentMethod, paymentIntentId } = req.body;
        const userId = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Order must contain at least one item" 
            });
        }

        // If payment method is card, verify payment intent
        if (paymentMethod === 'card' && paymentIntentId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Payment not completed" 
                });
            }
        }

        // If payment method is rfcard, check and deduct balance
        if (paymentMethod === 'rfcard') {
            const rfCardNumber = req.body.rfCardNumber;
            if (!rfCardNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'RF Card number is required.'
                });
            }
            const rfCardModel = (await import('../models/rfCardModel.js')).default;
            const rfCard = await rfCardModel.findOne({ cardNumber: rfCardNumber });
            if (!rfCard) {
                return res.status(400).json({
                    success: false,
                    message: 'RF Card not found.'
                });
            }
            // Calculate total amount
            let totalAmount = 0;
            for (const item of items) {
                const food = await foodModel.findById(item.foodId);
                if (!food) {
                    return res.status(400).json({
                        success: false,
                        message: `Food item ${item.foodId} not found`
                    });
                }
                totalAmount += food.price * item.quantity;
            }
            if (rfCard.balance < totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient RF Card balance.'
                });
            }
            rfCard.balance -= totalAmount;
            rfCard.lastUsed = new Date();
            await rfCard.save();

            // Credit the business account
            const accountModel = (await import('../models/accountModel.js')).default;
            // You can use a fixed business account name, e.g., 'main-business'
            const businessAccount = await accountModel.findOneAndUpdate(
                { name: 'main-business' },
                { $inc: { balance: totalAmount }, $set: { lastUpdated: new Date() } },
                { upsert: true, new: true }
            );
        }

        // Validate and enrich items with food details
        const enrichedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const food = await foodModel.findById(item.foodId);
            if (!food) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Food item ${item.foodId} not found` 
                });
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

        // Format delivery address
        const formattedDeliveryAddress = {
            name: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
            phone: deliveryAddress.phone,
            address: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipcode}, ${deliveryAddress.country}`,
            landmark: '',
            pincode: deliveryAddress.zipcode
        };

        // Create order with payment status
        const order = new orderModel({
            userId,
            items: enrichedItems,
            totalAmount,
            deliveryAddress: formattedDeliveryAddress,
            specialInstructions: specialInstructions || '',
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: (paymentMethod === 'card' || paymentMethod === 'rfcard') ? 'completed' : 'pending',
            isTodaySpecial: enrichedItems.some(item => item.isTodaySpecial),
            rfCardNumber: paymentMethod === 'rfcard' ? req.body.rfCardNumber : undefined
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
                paymentStatus: order.paymentStatus,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                tokenNumber: order.tokenNumber
            }
        });

    } catch (error) {
        console.error("Process order with payment error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error processing order with payment" 
        });
    }
};

export {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    processOrderWithPayment
};

