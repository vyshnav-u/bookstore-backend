
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    console.log("Inside Authentication Middleware");

    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing"
        });
    }

    // Check Bearer token format
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization format. Use Bearer token."
        });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing from environment variables");

        return res.status(500).json({
            success: false,
            message: "Server authentication configuration error"
        });
    }

    try {
        const jwtResponse = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.payload = {
            userId: jwtResponse.userId,
            email: jwtResponse.email,
            role: jwtResponse.role
        };

        console.log("Authenticated user:", req.payload.email);
        console.log("User role:", req.payload.role);

        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;
