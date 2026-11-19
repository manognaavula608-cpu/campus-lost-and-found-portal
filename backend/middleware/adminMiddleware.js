
import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("role");

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        next();

    } catch (error) {
        res.status(500).json({
            message: "Unable to verify admin access"
        });
    }
};

export default adminMiddleware;
