// Get all low/out-of-stock items
const getLowStockItems = async (req, res) => {
    try {
        const items = await foodModel.find({ stock: { $lte: { $ifNull: ["$lowStockThreshold", 5] } } });
        // fallback: if $ifNull not supported, use default 5
        const fallbackItems = await foodModel.find({ stock: { $lte: 5 } });
        res.json({ success: true, items: items.length ? items : fallbackItems });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching low stock items' });
    }
};
// Update stock for a food item
const updateStock = async (req, res) => {
    try {
        const { id } = req.body;
        let { stock } = req.body;
        stock = Number(stock);
        if (!id || isNaN(stock) || stock < 0) {
            return res.status(400).json({ success: false, message: 'Invalid food ID or stock value' });
        }
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }
        food.stock = stock;
        await food.save();
        res.json({ success: true, message: 'Stock updated', stock: food.stock });
    } catch (error) {
        console.log('Error updating stock:', error);
        res.status(500).json({ success: false, message: 'Error updating stock' });
    }
};
import foodModel from "../models/foodModel.js";
import fs from 'fs'

// add food

const addFood = async (req, res) => {
    try {
        const file = req.file;
        const image_filename = file.filename;

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            todaysMenu: req.body.todaysMenu || false
        });

        await food.save();
        res.json({ success: true, message: "Food Added"});
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//All food list

const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// remove food item

const removeFood = async (req,res)=> {
try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`,()=>{})

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({success:true,message:"Food Removed"})
} catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
    
}
}

// Get today's menu
const getTodaysMenu = async (req, res) => {
    try {
        // Only return items marked as today's menu
        const todaysMenu = await foodModel.find({ todaysMenu: true })
        res.json(todaysMenu)
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching today's menu" })
    }
}

// Initialize existing food items with todaysMenu field
const initializeTodaysMenu = async (req, res) => {
    try {
        console.log('Initializing todaysMenu field for existing food items...');
        
        // Find all food items that don't have the todaysMenu field
        const foodsWithoutField = await foodModel.find({ todaysMenu: { $exists: false } });
        console.log(`Found ${foodsWithoutField.length} items without todaysMenu field`);
        
        if (foodsWithoutField.length > 0) {
            // Update all items to have todaysMenu: false
            const result = await foodModel.updateMany(
                { todaysMenu: { $exists: false } },
                { $set: { todaysMenu: false } }
            );
            console.log(`Updated ${result.modifiedCount} items`);
        }
        
        // Get total count
        const totalFoods = await foodModel.countDocuments();
        const todaysMenuCount = await foodModel.countDocuments({ todaysMenu: true });
        
        res.json({ 
            success: true, 
            message: `Database initialized. Total items: ${totalFoods}, In today's menu: ${todaysMenuCount}`,
            totalItems: totalFoods,
            todaysMenuItems: todaysMenuCount
        });
    } catch (error) {
        console.log('Error initializing todaysMenu:', error);
        res.status(500).json({ success: false, message: "Error initializing database" });
    }
}

// Toggle food item in/out of today's menu
const toggleTodaysMenu = async (req, res) => {
    try {
        console.log('toggleTodaysMenu called with body:', req.body);
        const { id } = req.body;
        console.log('Food ID to toggle:', id);
        
        if (!id) {
            console.log('No ID provided in request body');
            return res.status(400).json({ success: false, message: "Food ID is required" });
        }
        
        // Check if the ID is valid MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid ID format:', id);
            return res.status(400).json({ success: false, message: "Invalid food ID format" });
        }
        
        const food = await foodModel.findById(id);
        console.log('Food item found:', food);
        
        if (!food) {
            console.log('Food item not found with ID:', id);
            
            // Get some sample IDs to help debug
            const sampleFoods = await foodModel.find().limit(3).select('_id name');
            console.log('Sample food items in database:', sampleFoods);
            
            return res.status(404).json({ 
                success: false, 
                message: "Food item not found",
                providedId: id,
                sampleIds: sampleFoods.map(f => ({ id: f._id, name: f.name }))
            });
        }

        // Toggle the todaysMenu status
        const previousStatus = food.todaysMenu;
        food.todaysMenu = !food.todaysMenu;
        console.log(`Toggling todaysMenu from ${previousStatus} to ${food.todaysMenu}`);
        
        await food.save();
        console.log('Food item updated successfully');

        res.json({ 
            success: true, 
            message: food.todaysMenu ? "Added to Today's Menu" : "Removed from Today's Menu",
            todaysMenu: food.todaysMenu,
            itemName: food.name
        });
    } catch (error) {
        console.log('Error in toggleTodaysMenu:', error);
        res.status(500).json({ success: false, message: "Error toggling today's menu status" });
    }
}

// Test endpoint to verify backend is working
const testEndpoint = async (req, res) => {
    try {
        res.json({ 
            success: true, 
            message: "Backend is working!",
            timestamp: new Date().toISOString(),
            endpoint: "test"
        });
    } catch (error) {
        console.log('Error in test endpoint:', error);
        res.status(500).json({ success: false, message: "Test endpoint error" });
    }
}

export { addFood, listFood, removeFood, getTodaysMenu, toggleTodaysMenu, testEndpoint, initializeTodaysMenu, updateStock, getLowStockItems }