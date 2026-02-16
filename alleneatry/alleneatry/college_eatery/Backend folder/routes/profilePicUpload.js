import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// POST /api/user/upload-profile-pic
router.post("/upload-profile-pic", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, message: "No image provided" });
    // Parse base64
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ success: false, message: "Invalid image format" });
    const ext = matches[1].split("/")[1];
    const data = matches[2];
    const filename = `profile_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(data, "base64"));
    const url = `/images/${filename}`;
    res.json({ success: true, url });
  } catch (err) {
    console.error("Profile pic upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

export default router;
