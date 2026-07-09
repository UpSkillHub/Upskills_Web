export default {
  "/enrollments/enroll": {
    post: {
      summary: "Enroll in a course",
      description:
        "Enroll the authenticated student in a course (payment required if course has a price).",
      tags: ["Enrollments"],
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
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Successfully enrolled in course",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Successfully enrolled in course",
                  },
                  data: {
                    type: "object",
                    properties: {
                      enrollment: { $ref: "#/components/schemas/Enrollment" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "Already enrolled, payment required, or course not published",
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Students only" },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/enrollments/user/{userId}": {
    get: {
      summary: "Get user enrollments",
      description:
        "Returns all enrollments for a specific user. Admin or the user themselves.",
      tags: ["Enrollments"],
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
          description: "Filter by status",
          schema: { type: "string", enum: ["active", "completed", "dropped"] },
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
          description: "Enrollments retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      enrollments: {
                        type: "array",
                        items: {
                          allOf: [
                            { $ref: "#/components/schemas/Enrollment" },
                            {
                              type: "object",
                              properties: {
                                course: { $ref: "#/components/schemas/Course" },
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
        403: {
          description: "Forbidden - Can only view own enrollments or be admin",
        },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/enrollments/course/{courseId}": {
    get: {
      summary: "Get course enrollments",
      description:
        "Returns all enrollments for a specific course. Trainer or Admin only.",
      tags: ["Enrollments"],
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
          schema: { type: "string", enum: ["active", "completed", "dropped"] },
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
          description: "Enrollments retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      enrollments: {
                        type: "array",
                        items: {
                          allOf: [
                            { $ref: "#/components/schemas/Enrollment" },
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

  "/enrollments/{id}/progress": {
    put: {
      summary: "Update enrollment progress",
      description:
        "Update the progress percentage of an enrollment. Student (self) or Trainer.",
      tags: ["Enrollments"],
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
              required: ["progress"],
              properties: {
                progress: {
                  type: "integer",
                  minimum: 0,
                  maximum: 100,
                  example: 50,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Progress updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Progress updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      enrollment: { $ref: "#/components/schemas/Enrollment" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Progress must be between 0 and 100",
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Only student or trainer" },
        404: { description: "Enrollment not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/enrollments/{id}": {
    delete: {
      summary: "Unenroll from course",
      description:
        'Drop a course enrollment (soft delete - status changes to "dropped"). Student only.',
      tags: ["Enrollments"],
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
          description: "Unenrolled successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Successfully unenrolled from course",
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Students only" },
        404: { description: "Enrollment not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/enrollments/stats": {
    get: {
      summary: "Get enrollment statistics",
      description:
        "Returns enrollment statistics (total, active, completed, dropped). Admin or Trainer.",
      tags: ["Enrollments"],
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
                      active: { type: "integer" },
                      completed: { type: "integer" },
                      dropped: { type: "integer" },
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
