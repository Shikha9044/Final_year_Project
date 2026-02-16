import express from "express";
import AdminUser from "../models/adminUserModel.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Admin login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await AdminUser.findOne({ username });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ success: true, token });
});

// (Optional) Create admin user (for setup only, remove in production)
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Username and password required" });
  const exists = await AdminUser.findOne({ username });
  if (exists) return res.status(400).json({ success: false, message: "Username already exists" });
  const user = new AdminUser({ username, password });
  await user.save();
  res.json({ success: true, message: "Admin user created" });
});

// This file has been disabled for admin authentication routes.
export default router;
