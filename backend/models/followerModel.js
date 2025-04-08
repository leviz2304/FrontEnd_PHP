import mongoose from "mongoose";

const followerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);
const followerModel = mongoose.models.follower || mongoose.model("Follower", followerSchema);


export default followerModel;