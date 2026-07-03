import db from "../models/index.js";
import {
  initiateFlutterwavePayment,
  verifyTransaction,
} from "../services/flutterwaveService.js";

const { Payment, User, Course, Enrollment } = db;

// ============ INITIATE PAYMENT (Updated) ============
export const initiatePayment = async (req, res) => {
  try {
    const { course_id, payment_method } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Check if course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course has a price
    if (parseFloat(course.price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "This course is free. No payment required.",
      });
    }

    // Get user details
    const user = await User.findByPk(user_id);

    // Check if user already has a pending payment
    const existingPayment = await Payment.findOne({
      where: {
        user_id,
        course_id,
        status: "pending",
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "You have a pending payment for this course",
        data: { payment: existingPayment },
      });
    }

    // ============ NEW: Set currency based on payment method ============
    const paymentCurrency = payment_method === "mobilemoney" ? "RWF" : "USD";
    // Other options: KES (Kenya), UGX (Uganda), GHS (Ghana), NGN (Nigeria), TZS (Tanzania)

    // Generate transaction reference
    const tx_ref = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create payment record in database (pending)
    const payment = await Payment.create({
      user_id,
      course_id,
      amount: course.price,
      currency: paymentCurrency, // ← Dynamic currency!
      status: "pending",
      transaction_id: tx_ref,
      payment_method: payment_method || "card",
    });

    // Call Flutterwave to initiate payment
    const flutterwaveResponse = await initiateFlutterwavePayment({
      email: user.email,
      amount: course.price,
      currency: paymentCurrency, // ← Pass currency to service!
      tx_ref,
      fullname: user.name,
      phone_number: user.phone || "0000000000",
      payment_method: payment_method || "card",
    });

    if (!flutterwaveResponse.success) {
      // Update payment to failed
      await Payment.update({ status: "failed" }, { where: { id: payment.id } });

      return res.status(400).json({
        success: false,
        message: "Payment initiation failed",
        error: flutterwaveResponse.error,
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        payment,
        flutterwave: flutterwaveResponse.data,
        payment_link: flutterwaveResponse.data.data.link,
      },
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error initiating payment",
      error: error.message,
    });
  }
};

// ============ PAYMENT WEBHOOK (Flutterwave) ============
export const paymentWebhook = async (req, res) => {
  try {
    console.log("🔔 Webhook received!");

    // 1. Verify secret hash
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      console.log("❌ Secret hash mismatch!");
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    // 2. Get payload directly (it's at the root level!)
    const payload = req.body;

    // 3. Check if payment was successful
    if (payload.status === "successful") {
      console.log("✅ Payment successful! Processing...");

      const transactionId = payload.id;
      const txRef = payload.txRef;

      // 4. Find payment in database
      const payment = await Payment.findOne({
        where: { transaction_id: txRef },
      });

      if (!payment) {
        console.log(`❌ Payment not found for tx_ref: ${txRef}`);
        return res.status(200).send("Payment not found");
      }

      // 5. Check if already processed
      if (payment.status === "completed") {
        console.log("⚠️ Payment already processed");
        return res.status(200).send("Payment already processed");
      }

      // 6. Update payment status
      await Payment.update(
        {
          status: "completed",
          paid_at: new Date(),
          transaction_id: transactionId.toString(),
        },
        { where: { id: payment.id } },
      );

      // 7. Auto-enroll the user
      const existingEnrollment = await Enrollment.findOne({
        where: {
          user_id: payment.user_id,
          course_id: payment.course_id,
        },
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          user_id: payment.user_id,
          course_id: payment.course_id,
          status: "active",
          progress: 0,
          enrolled_at: new Date(),
        });
        console.log("✅ User enrolled in course!");
      } else {
        console.log("⚠️ User already enrolled");
      }

      console.log(`✅ Payment ${txRef} verified and enrollment completed`);
    } else {
      console.log(`⚠️ Payment status: ${payload.status} (not successful)`);
    }

    return res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.status(200).send("Webhook processed with error");
  }
};
// ============ CHECK PAYMENT STATUS ============
export const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({
      where: { transaction_id: transactionId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify with Flutterwave API
    const verification = await verifyTransaction(transactionId);

    if (verification.success) {
      const status = verification.data.data.status;

      // Update local payment status if needed
      if (status === "successful" && payment.status !== "completed") {
        await Payment.update(
          {
            status: "completed",
            paid_at: new Date(),
          },
          { where: { id: payment.id } },
        );
      }

      return res.status(200).json({
        success: true,
        data: {
          payment,
          flutterwave_status: status,
          verified: true,
        },
      });
    }

    res.status(200).json({
      success: false,
      message: "Could not verify payment",
      data: { payment },
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking payment status",
      error: error.message,
    });
  }
};

// ============ GET PAYMENT BY ID ============
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "price"],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check permission: user can only see their own payments
    if (
      req.user.role !== "admin" &&
      payment.user_id !== req.user.id &&
      req.user.role !== "trainer"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

// ============ GET USER PAYMENTS ============
export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check permission
    if (req.user.role !== "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own payments",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const where = { user_id: userId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user payments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// ============ GET PAYMENT STATS ============
export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.count();
    const completedPayments = await Payment.count({
      where: { status: "completed" },
    });
    const pendingPayments = await Payment.count({
      where: { status: "pending" },
    });
    const failedPayments = await Payment.count({
      where: { status: "failed" },
    });

    const result = await Payment.findAll({
      where: { status: "completed" },
      attributes: [
        [db.sequelize.fn("SUM", db.sequelize.col("amount")), "total_revenue"],
      ],
      raw: true,
    });

    const totalRevenue = result[0]?.total_revenue || 0;

    res.status(200).json({
      success: true,
      data: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        failed: failedPayments,
        total_revenue: parseFloat(totalRevenue),
      },
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment statistics",
      error: error.message,
    });
  }
};
