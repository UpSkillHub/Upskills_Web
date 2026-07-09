export default {
  "/payments/initiate": {
    post: {
      summary: "Initiate payment",
      description: "Initiates a payment for a course. Student only.",
      tags: ["Payments"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["course_id"],
              properties: {
                course_id: { type: "integer", example: 1 },
                payment_method: {
                  type: "string",
                  enum: ["card", "mobilemoney"],
                  example: "card",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Payment initiated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Payment initiated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      payment: { $ref: "#/components/schemas/Payment" },
                      payment_link: { type: "string" },
                      flutterwave: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "Course is free, already has pending payment, or validation error",
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Students only" },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/payments/webhook": {
    post: {
      summary: "Payment webhook",
      description: "Webhook endpoint for Flutterwave payment callbacks.",
      tags: ["Payments"],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                event: { type: "string", example: "charge.completed" },
                data: {
                  type: "object",
                  properties: {
                    id: { type: "integer", example: 10344437 },
                    tx_ref: { type: "string", example: "TXN-1234567890" },
                    status: { type: "string", example: "successful" },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Webhook processed successfully",
        },
        401: {
          description: "Unauthorized - Invalid secret hash",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },

  "/payments/user/{userId}": {
    get: {
      summary: "Get user payments",
      description:
        "Returns all payments for a specific user. Admin or the user themselves.",
      tags: ["Payments"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["pending", "completed", "failed", "refunded"],
          },
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
        },
      ],
      responses: {
        200: {
          description: "Payments retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      payments: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Payment" },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          totalPages: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden - Can only view own payments or be admin",
        },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/payments/{id}": {
    get: {
      summary: "Get payment by ID",
      description:
        "Returns payment details. Admin, the user who made the payment, or the trainer of the course.",
      tags: ["Payments"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Payment retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      payment: {
                        allOf: [
                          { $ref: "#/components/schemas/Payment" },
                          {
                            type: "object",
                            properties: {
                              user: { $ref: "#/components/schemas/User" },
                              course: { $ref: "#/components/schemas/Course" },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Payment not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/payments/stats": {
    get: {
      summary: "Get payment statistics",
      description:
        "Returns payment statistics (total, completed, pending, failed, revenue). Admin or Trainer.",
      tags: ["Payments"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Statistics retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      completed: { type: "integer" },
                      pending: { type: "integer" },
                      failed: { type: "integer" },
                      total_revenue: { type: "number", format: "float" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin or Trainer only" },
        500: { description: "Server error" },
      },
    },
  },

  "/payments/status/{transactionId}": {
    get: {
      summary: "Check payment status",
      description: "Verifies payment status with Flutterwave.",
      tags: ["Payments"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "transactionId",
          in: "path",
          required: true,
          description: "Transaction reference (tx_ref)",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Payment status retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "object",
                    properties: {
                      payment: { $ref: "#/components/schemas/Payment" },
                      flutterwave_status: { type: "string" },
                      verified: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Payment not found" },
        500: { description: "Server error" },
      },
    },
  },
};
