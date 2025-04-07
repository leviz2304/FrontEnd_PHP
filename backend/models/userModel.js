// backend/models/userModel.js
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
        ref: "Role", // Đảm bảo Role model cũng được đăng ký với tên "Role"
        required: true,
    },
    image: {
        type: String,
        default: '/default-avatar.png',
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
    // Thêm isBlocked nếu cần cho chức năng admin
    // isBlocked: { type: Boolean, default: false }

}, { minimize: false });

// --- SỬA Ở ĐÂY: Đăng ký model với tên "User" (viết hoa) ---
const userModel = mongoose.models.User || mongoose.model("User", userSchema);
// --- KẾT THÚC SỬA ---

export default userModel;