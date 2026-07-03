import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

// Initialize payment
export const initiateFlutterwavePayment = async (paymentData) => {
  try {
    const {
      email,
      amount,
      currency,
      tx_ref,
      fullname,
      phone_number,
      payment_method,
    } = paymentData; // ← Add currency here

    // Set payment options based on method
    let paymentOptions = "card";
    if (payment_method === "mobilemoney") {
      paymentOptions = "mobilemoney";
    } else if (payment_method === "both") {
      paymentOptions = "card,mobilemoney";
    }

    const response = await axios.post(
      `${FLW_BASE_URL}/payments`,
      {
        tx_ref,
        amount,
        currency: currency || "USD", // ← Dynamic currency!
        redirect_url: "https://frontend-url.com/payment-callback",
        payment_options: paymentOptions,
        customer: {
          email,
          phonenumber: phone_number,
          name: fullname,
        },
        customizations: {
          title: "UP SKILLS HUB",
          description: "Course Enrollment Payment",
          logo: "https://your-logo-url.com/logo.png",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Flutterwave initiate payment error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Verify transaction
export const verifyTransaction = async (transactionId) => {
  try {
    const response = await axios.get(
      `${FLW_BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Flutterwave verify transaction error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};
