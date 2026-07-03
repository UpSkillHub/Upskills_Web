import express from "express";
import {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/course/:courseId", getModulesByCourse);
router.get("/:id", getModuleById);

// PROTECTED ROUTES
router.post("/", verifyToken, authorize("trainer", "admin"), createModule);
router.put("/:id", verifyToken, authorize("trainer", "admin"), updateModule);
router.delete("/:id", verifyToken, authorize("trainer", "admin"), deleteModule);

export default router;
