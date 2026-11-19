
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({

    itemName: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    type: {
        type: String,
        enum: ["lost", "found"],
        required: true
    },

    imageUrl: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["active", "claimed", "recovered"],
        default: "active"
    },

    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

export default Item;
