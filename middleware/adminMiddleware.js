
const adminMiddleware = (req, res, next) => {
    if (req.payload?.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};

module.exports = adminMiddleware;