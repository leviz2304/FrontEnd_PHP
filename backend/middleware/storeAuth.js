import jwt from "jsonwebtoken";
import storeModel from "../models/storeModel.js";

const storeAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "không có token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const store = await storeModel.findOne({ ownerId: userId, status: "approved" });
    if (!store) {
      return res.json({ success: false, message: "You do not have an approved store" });
    }
    req.store = store;
    next();
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export default storeAuth;
