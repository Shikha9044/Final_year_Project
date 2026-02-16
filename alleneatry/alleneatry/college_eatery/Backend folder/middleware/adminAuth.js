import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminAuthMiddleware = async (req, res, next) => {
    let token;
    
    // Check for token in Authorization header (Bearer token) or in headers.token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.token) {
        token = req.headers.token;
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized, please login again" });
    }
    // Allow dummy token for demo
    if (token === 'admin-demo-token') {
        req.user = { id: 'demo-admin' };
        return next();
    }
    try {
        const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development_only';
        const token_decode = jwt.verify(token, secret);
        // Check if user exists and is admin
        const user = await userModel.findById(token_decode.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        // For now, we'll allow any authenticated user to access admin routes
        // In production, you should add an isAdmin field to the user model
        req.user = { id: token_decode.id };
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
}

export default adminAuthMiddleware;
