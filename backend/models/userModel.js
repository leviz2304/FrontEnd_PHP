import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    createdAt: {
        type: Date,
        default: Date.now,
      },
      roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
      },
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema)

export default userModel