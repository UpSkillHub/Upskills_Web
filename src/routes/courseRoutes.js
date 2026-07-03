import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByTrainer,
} from "../controllers/courseController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Get courses by trainer
router.get("/trainer/:trainerId", getCoursesByTrainer);

// PROTECTED ROUTES
router.post("/", verifyToken, authorize("trainer", "admin"), createCourse);
router.put("/:id", verifyToken, authorize("trainer", "admin"), updateCourse);
router.delete("/:id", verifyToken, authorize("trainer", "admin"), deleteCourse);

export default router;
