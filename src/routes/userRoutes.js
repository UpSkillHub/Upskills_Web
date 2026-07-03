import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  hardDeleteUser,
  getUserStats,
} from "../controllers/userController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

//  ALL ROUTES REQUIRE ADMIN ACCESS
router.use(verifyToken);
router.use(authorize("admin"));

router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Hard delete user (permanently remove)
router.delete("/:id/permanent", hardDeleteUser);

export default router;
