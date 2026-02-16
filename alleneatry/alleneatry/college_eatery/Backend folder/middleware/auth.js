import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
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

    try {
        const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development_only';
        const token_decode = jwt.verify(token, secret);
        req.user = { id: token_decode.id }; // Set req.user.id for consistency
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
}

export default authMiddleware;