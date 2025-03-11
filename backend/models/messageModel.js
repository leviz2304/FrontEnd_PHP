import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    senderType: {
      type: String,
      enum: ["user", "store", "admin"],
      required: true,
    },
    userNotificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserNotification",
    },
  },
  { minimize: false }
);
const messageModel = mongoose.models.message || mongoose.model("Message", messageSchema);

export default messageModel;
