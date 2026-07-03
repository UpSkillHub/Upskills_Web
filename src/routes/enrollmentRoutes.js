import express from "express";
import {
  enrollInCourse,
  getUserEnrollments,
  getCourseEnrollments,
  updateProgress,
  unenrollFromCourse,
  getEnrollmentStats,
} from "../controllers/enrollmentController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

//  PROTECTED ROUTES
router.post("/enroll", verifyToken, authorize("student"), enrollInCourse);
router.get("/user/:userId", verifyToken, getUserEnrollments);

router.get(
  "/course/:courseId",
  verifyToken,
  authorize("trainer", "admin"),
  getCourseEnrollments,
);

router.put("/:id/progress", verifyToken, updateProgress);
router.delete("/:id", verifyToken, authorize("student"), unenrollFromCourse);

router.get(
  "/stats",
  verifyToken,
  authorize("admin", "trainer"),
  getEnrollmentStats,
);

export default router;
