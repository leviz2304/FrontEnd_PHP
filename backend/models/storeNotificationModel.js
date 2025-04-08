import mongoose from "mongoose";

const storeNotificationSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);
const storeNotificationModel = mongoose.models.storeNotification || mongoose.model("StoreNotification", storeNotificationSchema);
export default storeNotificationModel
