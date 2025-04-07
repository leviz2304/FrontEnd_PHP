// backend/routes/userRoute.js
import express from "express"
import { adminLogin, loginUser, registerUser,updateUserProfile,updateUserAvatar } from "../controllers/userController.js"
import authUser from "../middleware/auth.js"; 
import { getUserInfo } from "../controllers/userController.js"; 
import upload from "../middleware/multer.js"; 
const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/info', authUser, getUserInfo); 
userRouter.put('/profile', authUser, updateUserProfile);
userRouter.put('/avatar', authUser, upload.single('avatar'), updateUserAvatar);

export default userRouter