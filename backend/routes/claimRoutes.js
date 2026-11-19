
import express from "express";

import {
    createClaim,
    getMyClaims,
    getAllClaims,
    updateClaimStatus
} from "../controllers/claimController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Student submits a claim
router.post("/", authMiddleware, createClaim);

// Student views their own claims
router.get("/my", authMiddleware, getMyClaims);

// Admin views all claims
router.get("/", authMiddleware, adminMiddleware, getAllClaims);

// Admin approves or rejects a claim
router.put("/:id", authMiddleware, adminMiddleware, updateClaimStatus);

export default router;
