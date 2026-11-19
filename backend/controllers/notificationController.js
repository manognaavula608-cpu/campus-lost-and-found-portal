
import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id
        })
        .populate("relatedItem", "itemName category")
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: notifications.length,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
