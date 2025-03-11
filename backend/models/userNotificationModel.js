import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema(
  {
    // Relationship to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    // Relationship to Order (optional if needed by your logic)
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);
const userNotificationModel = mongoose.models.userNotification || mongoose.model("UserNotification", userNotificationSchema);
export default userNotificationModel
