import reviewModel from "../models/reviewModel.js";

export const reviewById = async (req, res, next, id) => {
  try {
    const review = await reviewModel.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    req.review = review;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
