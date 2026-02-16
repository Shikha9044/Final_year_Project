import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoutes.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import profilePicUploadRouter from "./routes/profilePicUpload.js";
import adminProfilePicUploadRouter from "./routes/adminProfilePicUpload.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import 'dotenv/config.js';

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// db connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);


app.use("/api/payment", paymentRouter);
app.use("/api/user", profilePicUploadRouter); // user profile pic upload endpoint
app.use("/api/admin", adminProfilePicUploadRouter); // admin profile pic upload endpoint
app.use("/api/feedback", feedbackRoutes); // feedback endpoints

// root endpoint
app.get("/", (req, res) => {
    res.send("API Working");
});

// start server
app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});