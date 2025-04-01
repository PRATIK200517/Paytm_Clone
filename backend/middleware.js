const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // More detailed error responses
    if (!authHeader) {
        return res.status(403).json({ 
            success: false,
            message: "Authorization header missing",
            solution: "Include 'Authorization: Bearer <token>' header"
        });
    }

    // More flexible token extraction
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(403).json({
            success: false,
            message: "Invalid authorization format",
            solution: "Use format: 'Bearer <token>'"
        });
    }

    // Clean the token
    let token = tokenParts[1].trim();
    token = token.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes if present

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "Empty token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Additional validation
        if (!decoded.userId) {
            return res.status(403).json({
                success: false,
                message: "Invalid token payload",
                error: "Token missing userId"
            });
        }

        req.userId = decoded.userId;
        next();
    } catch (err) {
        let errorMessage = "Invalid token";
        let statusCode = 403;
        
        if (err.name === "TokenExpiredError") {
            errorMessage = "Token expired";
            statusCode = 401; // 401 is more appropriate for expired tokens
        } else if (err.name === "JsonWebTokenError") {
            errorMessage = "Malformed token";
        }
        
        return res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            solution: statusCode === 401 ? "Please login again" : "Check your token"
        });
    }
};

module.exports = {
    authMiddleware
};