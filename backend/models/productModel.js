import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store", // Đảm bảo Store model được đăng ký là "Store"
        required: true,
    },
    name:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number, required:true},
    image:{type:Array, required:true},
    category:{type:String, required:true},
    colors:{type:Array, default: []}, // Default thành mảng rỗng
    popular:{type:Boolean, default: false}, // Có default hợp lý
    date:{type:Date, default: Date.now}, // Dùng Date thay vì Number, có default
}, { timestamps: true }); // Thêm timestamps nếu muốn createdAt, updatedAt

// Đăng ký với tên PascalCase "Product"
const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;