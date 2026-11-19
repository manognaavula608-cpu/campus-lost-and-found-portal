
import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";

// Student submits a claim
export const createClaim = async (req, res) => {
    try {
        const { itemId, message } = req.body;

        if (!itemId || !message || !message.trim()) {
            return res.status(400).json({
                message: "Item ID and claim message are required"
            });
        }

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (item.type !== "found" || item.status !== "active") {
            return res.status(400).json({
                message: "This item is not available for claiming"
            });
        }

        const existingClaim = await Claim.findOne({
            item: itemId,
            claimant: req.user.id,
            status: { $in: ["pending", "approved"] }
        });

        if (existingClaim) {
            return res.status(409).json({
                message: "You have already submitted a claim for this item"
            });
        }

        const claim = await Claim.create({
            item: itemId,
            claimant: req.user.id,
            message: message.trim()
        });

        res.status(201).json({
            message: "Claim submitted successfully",
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


 // Student views their own claims
export const getMyClaims = async (req, res) => {
    try {
        const claims = await Claim.find({
            claimant: req.user.id
        })
        .populate(
            "item",
            "itemName category location type status imageUrl"
        )
        .populate("reviewedBy", "name")
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Admin views all claims
export const getAllClaims = async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate("item", "itemName category location")
            .populate("claimant", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Admin approves or rejects a claim
export const updateClaimStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        if (claim.status !== "pending") {
            return res.status(400).json({
                message: "This claim has already been reviewed"
            });
        }

        const item = await Item.findById(claim.item);

        if (status === "approved") {
            if (!item || item.status !== "active") {
                return res.status(400).json({
                    message: "This item is no longer available"
                });
            }

            item.status = "claimed";
            await item.save();
        }

        claim.status = status;
        claim.reviewedBy = req.user.id;
        await claim.save();

        // Create notification for the student
        const itemName = item ? item.itemName : "your claimed item";

        const notificationMessage = status === "approved"
            ? `Your claim for ${itemName} has been approved!`
            : `Your claim for ${itemName} has been rejected.`;

        await Notification.create({
            user: claim.claimant,
            message: notificationMessage,
            type: status === "approved"
                ? "claim_approved"
                : "claim_rejected",
            relatedItem: claim.item
        });

        res.status(200).json({
            message: `Claim ${status} successfully`,
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
