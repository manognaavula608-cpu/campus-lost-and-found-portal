
import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    findPotentialMatches
} from "../controllers/itemController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// View all items
router.get("/", getAllItems);


router.get("/:id/matches", findPotentialMatches);

// View one item
router.get("/:id", getItemById);

// Protected routes
router.post("/", authMiddleware, upload.single("image"), createItem);
router.put("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);

export default router;
