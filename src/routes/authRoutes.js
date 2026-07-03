import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// PROTECTED ROUTES
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

export default router;
