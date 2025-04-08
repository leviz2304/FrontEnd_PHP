import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeAddress: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    storeLogo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const storeModel = mongoose.models.store || mongoose.model("Store", storeSchema);
export default storeModel;
