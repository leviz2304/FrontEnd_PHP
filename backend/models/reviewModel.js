import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true },
  reviewText: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const reviewModel = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default reviewModel;
