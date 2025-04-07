import reviewModel from "../models/reviewModel.js";

export const submitReview = async (req, res) => {
  try {
    const { productId, rating, reviewText } = req.body;
    const userId = req.user?.id || req.body.userId;

    const newReview = new reviewModel({
      productId,
      userId,
      rating,
      reviewText,
      date: Date.now(),
    });

    await newReview.save();
    res.json({ success: true, message: "Review submitted successfully", review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getReviewsByProductId = async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await reviewModel.find({ productId });
      res.json({ success: true, reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };