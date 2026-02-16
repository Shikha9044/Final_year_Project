



import express from 'express';
import {
    addFood,
    listFood,
    removeFood,
    getTodaysMenu,
    toggleTodaysMenu,
    testEndpoint,
    initializeTodaysMenu,
    updateStock,
    getLowStockItems
} from '../controllers/foodController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';

const foodRouter = express.Router();

// image storage Engine
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    },
});


const upload = multer({ storage: storage });


foodRouter.get('/test', testEndpoint);
foodRouter.get('/initialize', initializeTodaysMenu);
foodRouter.post('/add', upload.single('image'), addFood);
foodRouter.get('/list', listFood);
foodRouter.post('/remove', removeFood);
foodRouter.get('/todays-menu', getTodaysMenu);
foodRouter.post('/toggle-todays-menu', toggleTodaysMenu);
foodRouter.post('/update-stock', adminAuth, updateStock);
foodRouter.get('/low-stock', adminAuth, getLowStockItems);


export default foodRouter;