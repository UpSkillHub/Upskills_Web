export default {
  "/courses": {
    get: {
      summary: "Get all courses",
      tags: ["Courses"],
      parameters: [
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
        {
          name: "is_published",
          in: "query",
          schema: { type: "boolean" },
        },
      ],
      responses: {
        200: {
          description: "Courses retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      courses: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Course" },
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
        500: { description: "Server error" },
      },
    },
    post: {
      summary: "Create a course",
      tags: ["Courses"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title"],
              properties: {
                title: {
                  type: "string",
                  example: "Introduction to Programming",
                },
                description: {
                  type: "string",
                  example: "Learn the basics of programming",
                },
                price: { type: "number", format: "float", example: 49.99 },
                is_published: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Course created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Course created successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      course: { $ref: "#/components/schemas/Course" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Trainer or Admin only" },
        500: { description: "Server error" },
      },
    },
  },

  "/courses/{id}": {
    get: {
      summary: "Get course by ID",
      tags: ["Courses"],
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
          description: "Course retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      course: {
                        allOf: [
                          { $ref: "#/components/schemas/Course" },
                          {
                            type: "object",
                            properties: {
                              enrollment_count: { type: "integer" },
                              modules: {
                                type: "array",
                                items: { $ref: "#/components/schemas/Module" },
                              },
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
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
    put: {
      summary: "Update a course",
      tags: ["Courses"],
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
                title: { type: "string", example: "Advanced Programming" },
                description: { type: "string", example: "Updated description" },
                price: { type: "number", format: "float", example: 79.99 },
                is_published: { type: "boolean", example: false },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Course updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Course updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      course: { $ref: "#/components/schemas/Course" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden - Only trainer who created it or admin",
        },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      summary: "Delete a course",
      tags: ["Courses"],
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
          description: "Course deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Course deleted successfully",
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden - Only trainer who created it or admin",
        },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/courses/trainer/{trainerId}": {
    get: {
      summary: "Get courses by trainer",
      tags: ["Courses"],
      parameters: [
        {
          name: "trainerId",
          in: "path",
          required: true,
          schema: { type: "integer" },
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
          description: "Courses retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      courses: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Course" },
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
        404: { description: "Trainer not found" },
        500: { description: "Server error" },
      },
    },
  },
};
