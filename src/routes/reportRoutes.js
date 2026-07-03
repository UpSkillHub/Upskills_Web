import express from "express";
import {
  submitReport,
  getUserReports,
  getCourseReports,
  getReportById,
  updateReport,
  reviewReport,
  getReportStats,
} from "../controllers/reportController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

//  PROTECTED ROUTES
router.post("/", verifyToken, authorize("student"), submitReport);
router.get("/user/:userId", verifyToken, getUserReports);

router.get(
  "/course/:courseId",
  verifyToken,
  authorize("trainer", "admin"),
  getCourseReports,
);

// Get report statistics (Trainer/Admin)
router.get(
  "/stats",
  verifyToken,
  authorize("admin", "trainer"),
  getReportStats,
);

router.get("/:id", verifyToken, getReportById);
router.put("/:id", verifyToken, authorize("student"), updateReport);

// Review report (Trainer/Admin only)
router.put(
  "/:id/review",
  verifyToken,
  authorize("trainer", "admin"),
  reviewReport,
);

export default router;
