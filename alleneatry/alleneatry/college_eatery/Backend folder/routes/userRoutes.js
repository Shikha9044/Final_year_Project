import express from "express";
import { loginUser, registerUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword, registerStudent, loginStudent } from "../controllers/usercontroller.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
// Student auth endpoints
userRouter.post("/student/register", registerStudent);
userRouter.post("/student/login", loginStudent);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.put("/profile", authMiddleware, updateUserProfile);

export default userRouter;
