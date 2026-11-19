
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["claim_approved", "claim_rejected", "item_match"],
        required: true
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
