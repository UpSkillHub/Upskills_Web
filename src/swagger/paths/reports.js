export default {
  "/reports": {
    post: {
      summary: "Submit a report",
      description: "Submit a weekly report for a course. Student only.",
      tags: ["Reports"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["course_id", "title", "content"],
              properties: {
                course_id: { type: "integer", example: 1 },
                title: { type: "string", example: "Weekly Report Week 1" },
                content: {
                  type: "string",
                  example:
                    "This week I learned about variables and functions...",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Report submitted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Report submitted successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      report: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Not enrolled in course, or missing required fields",
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Students only" },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/reports/user/{userId}": {
    get: {
      summary: "Get user reports",
      description:
        "Returns all reports for a specific user. Admin or the user themselves.",
      tags: ["Reports"],
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
            enum: ["draft", "submitted", "reviewed", "approved", "rejected"],
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
          description: "Reports retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      reports: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Report" },
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
          description: "Forbidden - Can only view own reports or be admin",
        },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/reports/course/{courseId}": {
    get: {
      summary: "Get course reports",
      description:
        "Returns all reports for a specific course. Trainer or Admin only.",
      tags: ["Reports"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "courseId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["draft", "submitted", "reviewed", "approved", "rejected"],
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
          description: "Reports retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      reports: {
                        type: "array",
                        items: {
                          allOf: [
                            { $ref: "#/components/schemas/Report" },
                            {
                              type: "object",
                              properties: {
                                user: { $ref: "#/components/schemas/User" },
                              },
                            },
                          ],
                        },
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
        403: { description: "Forbidden - Trainer or Admin only" },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/reports/{id}": {
    get: {
      summary: "Get report by ID",
      description:
        "Returns report details. Student (owner), Trainer of the course, or Admin.",
      tags: ["Reports"],
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
          description: "Report retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      report: {
                        allOf: [
                          { $ref: "#/components/schemas/Report" },
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
        404: { description: "Report not found" },
        500: { description: "Server error" },
      },
    },
    put: {
      summary: "Update a report",
      description: "Update a draft or submitted report. Student (owner) only.",
      tags: ["Reports"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "Updated Report Title" },
                content: { type: "string", example: "Updated content..." },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Report updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Report updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      report: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Report cannot be updated (reviewed or approved)",
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Student owner only" },
        404: { description: "Report not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/reports/{id}/review": {
    put: {
      summary: "Review a report",
      description: "Review a submitted report. Trainer of the course or Admin.",
      tags: ["Reports"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["reviewed", "approved", "rejected"],
                  example: "approved",
                },
                reviewer_comment: {
                  type: "string",
                  example: "Great work! Keep it up.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Report reviewed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Report approved successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      report: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Trainer or Admin only" },
        404: { description: "Report not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/reports/stats": {
    get: {
      summary: "Get report statistics",
      description:
        "Returns report statistics (total, submitted, reviewed, approved, rejected). Admin or Trainer.",
      tags: ["Reports"],
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
                      submitted: { type: "integer" },
                      reviewed: { type: "integer" },
                      approved: { type: "integer" },
                      rejected: { type: "integer" },
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
};
