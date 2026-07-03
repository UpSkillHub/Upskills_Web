import express from "express";
import {
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/module/:moduleId", getLessonsByModule);

// Get lesson by ID (anyone can view)
router.get("/:id", getLessonById);

//  PROTECTED ROUTES (Trainer/Admin only)
router.post("/", verifyToken, authorize("trainer", "admin"), createLesson);
router.put("/:id", verifyToken, authorize("trainer", "admin"), updateLesson);
router.delete("/:id", verifyToken, authorize("trainer", "admin"), deleteLesson);

export default router;
