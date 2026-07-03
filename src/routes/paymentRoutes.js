import express from "express";
import {
  initiatePayment,
  paymentWebhook,
  getUserPayments,
  getPaymentById,
  getPaymentStats,
  checkPaymentStatus,
} from "../controllers/paymentController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

//  PUBLIC ROUTES
router.post("/webhook", paymentWebhook);

//  PROTECTED ROUTES
router.get(
  "/stats",
  verifyToken,
  authorize("admin", "trainer"),
  getPaymentStats,
);

router.get("/status/:transactionId", verifyToken, checkPaymentStatus);

router.post("/initiate", verifyToken, authorize("student"), initiatePayment);
router.get("/user/:userId", verifyToken, getUserPayments);
router.get("/:id", verifyToken, getPaymentById);

export default router;
