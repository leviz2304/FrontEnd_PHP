import express from "express";
import { getReviewsByProductId, submitReview } from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const router = express.Router();

// Lấy review theo productId
router.get("/product/:productId", authUser, getReviewsByProductId);

// Route submit review (nếu cần)
router.post("/submit", authUser, submitReview);

export default router;
