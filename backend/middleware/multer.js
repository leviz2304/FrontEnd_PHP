// src/middleware/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Đảm bảo thư mục lưu tạm tồn tại
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    // Sử dụng timestamp để tránh trùng lặp
    callback(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
export default upload;
