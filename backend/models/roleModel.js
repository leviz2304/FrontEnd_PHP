import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true, // e.g. 'admin', 'user', etc.
    },
  },
  { timestamps: true }
);

const roleModel = mongoose.models.role || mongoose.model("Role", roleSchema);
export default roleModel