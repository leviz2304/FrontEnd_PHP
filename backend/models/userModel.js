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
    image: {
        type: String,
        default: '/default-avatar.png',
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
    // isBlocked: { type: Boolean, default: false }

}, { minimize: false });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;