import express from "express";
import { getReviewsByProductId, submitReview } from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const router = express.Router();

router.get("/product/:productId", authUser, getReviewsByProductId);

router.post("/submit", authUser, submitReview);

export default router;
