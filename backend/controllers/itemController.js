
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";


// 1. Create a new item and check for possible matches
export const createItem = async (req, res) => {
    try {
        const {
            itemName,
            category,
            description,
            location,
            date,
            type
        } = req.body;

        if (!itemName || !category || !description ||
            !location || !date || !type) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        if (!["lost", "found"].includes(type)) {
            return res.status(400).json({
                message: "Type must be lost or found"
            });
        }

        // Save the new item
        const item = await Item.create({
            itemName,
            category,
            description,
            location,
            date,
            type,
            imageUrl: req.file
                ? `/uploads/${req.file.filename}`
                : "",
            reportedBy: req.user.id
        });

        // Find active items of the opposite type
        // in the same category and location
        const oppositeType = type === "lost" ? "found" : "lost";

        const possibleMatches = await Item.find({
            type: oppositeType,
            status: "active",
            category: {
                $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            },
            location: {
                $regex: `^${location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            },
            reportedBy: { $ne: req.user.id }
        });

        // Notify both students about possible matches
        if (possibleMatches.length > 0) {
            const notifications = [];

            for (const match of possibleMatches) {
                notifications.push({
                    user: match.reportedBy,
                    message: `A possible match was found for your ${match.type} item: ${match.itemName}.`,
                    type: "item_match",
                    relatedItem: item._id
                });

                notifications.push({
                    user: req.user.id,
                    message: `A possible match was found for your ${type} item: ${itemName}.`,
                    type: "item_match",
                    relatedItem: match._id
                });
            }

            await Notification.insertMany(notifications);
        }

        res.status(201).json({
            message: "Item reported successfully",
            item,
            possibleMatches: possibleMatches.length
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// Safely escape special characters in search text
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// 2. Get all items with search and filters
export const getAllItems = async (req, res) => {
    try {
        const { keyword, category, location, type, status, date } = req.query;
        const filter = {};

        // Search by item name or description
        if (keyword) {
            const safeKeyword = escapeRegex(keyword);

            filter.$or = [
                { itemName: { $regex: safeKeyword, $options: "i" } },
                { description: { $regex: safeKeyword, $options: "i" } }
            ];
        }

        // Filter by category
        if (category) {
            filter.category = {
                $regex: escapeRegex(category),
                $options: "i"
            };
        }

        // Filter by location
        if (location) {
            filter.location = {
                $regex: escapeRegex(location),
                $options: "i"
            };
        }

        // Filter by lost or found
        if (type) {
            if (!["lost", "found"].includes(type.toLowerCase())) {
                return res.status(400).json({
                    message: "Type must be lost or found"
                });
            }

            filter.type = type.toLowerCase();
        }

        // Filter by item status
        if (status) {
           if (!["active", "claimed", "recovered"].includes(status.toLowerCase())) {
              return res.status(400).json({
                  message: "Invalid status"
              });
            }

            filter.status = status.toLowerCase();
        }

        // Filter by item date
        if (date) {
            const selectedDate = new Date(date);

            if (Number.isNaN(selectedDate.getTime())) {
               return res.status(400).json({
                  message: "Invalid date"
               });
            }

            const startDate = new Date(date + "T00:00:00.000Z");
            const endDate = new Date(date + "T23:59:59.999Z");

            filter.date = {
                $gte: startDate,
                $lte: endDate
            };
        }


        const items = await Item.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// 3. Get one item by ID
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json(item);

    } catch (error) {
        res.status(400).json({
            message: "Invalid item ID"
        });
    }
};

// 4. Update an item
export const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (item.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can update only your own items"
            });
        }

        const allowedFields = [
            "itemName", "category", "description",
            "location", "date", "type", "imageUrl"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });

        await item.save();

        res.status(200).json({
            message: "Item updated successfully",
            item
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// 5. Delete an item
export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (item.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can delete only your own items"
            });
        }

        await item.deleteOne();

        res.status(200).json({
            message: "Item deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid item ID"
        });
    }
};


// Calculate similarity between two text values
const calculateSimilarity = (text1, text2) => {
    const words1 = new Set(
        text1.toLowerCase().match(/[a-z0-9]+/g) || []
    );

    const words2 = new Set(
        text2.toLowerCase().match(/[a-z0-9]+/g) || []
    );

    if (words1.size === 0 || words2.size === 0) {
        return 0;
    }

    const commonWords = [...words1].filter(word => words2.has(word));

    const totalWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalWords;
};


// 6. Find possible matches for a lost or found item
export const findPotentialMatches = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        // Lost items are compared with found items, and vice versa
        const oppositeType = item.type === "lost" ? "found" : "lost";

        const possibleItems = await Item.find({
            type: oppositeType,
            status: "active",
            _id: { $ne: item._id }
        }).lean();

        const matches = possibleItems.map(candidate => {
            let score = 0;
            const reasons = [];

            // Compare category (35 points)
            if (
                item.category.toLowerCase() ===
                candidate.category.toLowerCase()
            ) {
                score += 35;
                reasons.push("Same category");
            }

            // Compare item names (30 points)
            const nameSimilarity = calculateSimilarity(
                item.itemName,
                candidate.itemName
            );

            if (nameSimilarity > 0) {
                const points = Math.round(nameSimilarity * 30);
                score += points;

                if (points >= 10) {
                    reasons.push("Similar item name");
                }
            }

            // Compare descriptions (20 points)
            const descriptionSimilarity = calculateSimilarity(
                item.description,
                candidate.description
            );

            if (descriptionSimilarity > 0) {
                const points = Math.round(descriptionSimilarity * 20);
                score += points;

                if (points >= 5) {
                    reasons.push("Similar description");
                }
            }

            // Compare locations (15 points)
            const locationSimilarity = calculateSimilarity(
                item.location,
                candidate.location
            );

            if (locationSimilarity > 0) {
                const points = Math.round(locationSimilarity * 15);
                score += points;

                if (points >= 5) {
                    reasons.push("Similar location");
                }
            }

            return {
                item: candidate,
                matchScore: score,
                reasons
            };
        });

        // Show matches with a score of at least 25%
        const filteredMatches = matches
            .filter(match => match.matchScore >= 25)
            .sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({
            message: "Potential matches found",
            count: filteredMatches.length,
            matches: filteredMatches
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
