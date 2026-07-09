export default {
  "/lessons": {
    post: {
      summary: "Create a lesson",
      tags: ["Lessons"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["module_id", "title"],
              properties: {
                module_id: { type: "integer", example: 1 },
                title: { type: "string", example: "Lesson 1: Variables" },
                content: {
                  type: "string",
                  example: "Learn about variables in JavaScript",
                },
                video_url: {
                  type: "string",
                  example: "https://example.com/video.mp4",
                },
                duration: { type: "integer", example: 15 },
                order: { type: "integer", example: 0 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Lesson created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Lesson created successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      lesson: { $ref: "#/components/schemas/Lesson" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Trainer or Admin only" },
        404: { description: "Module not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/lessons/module/{moduleId}": {
    get: {
      summary: "Get lessons by module",
      tags: ["Lessons"],
      parameters: [
        {
          name: "moduleId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Lessons retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      lessons: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Lesson" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: { description: "Module not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/lessons/{id}": {
    get: {
      summary: "Get lesson by ID",
      tags: ["Lessons"],
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
          description: "Lesson retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      lesson: { $ref: "#/components/schemas/Lesson" },
                    },
                  },
                },
              },
            },
          },
        },
        404: { description: "Lesson not found" },
        500: { description: "Server error" },
      },
    },
    put: {
      summary: "Update a lesson",
      tags: ["Lessons"],
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
                title: { type: "string", example: "Updated Lesson" },
                content: { type: "string", example: "Updated content" },
                video_url: {
                  type: "string",
                  example: "https://example.com/new-video.mp4",
                },
                duration: { type: "integer", example: 20 },
                order: { type: "integer", example: 1 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Lesson updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Lesson updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      lesson: { $ref: "#/components/schemas/Lesson" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: {
          description:
            "Forbidden - Only trainer who created the course or admin",
        },
        404: { description: "Lesson not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      summary: "Delete a lesson",
      tags: ["Lessons"],
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
          description: "Lesson deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Lesson deleted successfully",
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: {
          description:
            "Forbidden - Only trainer who created the course or admin",
        },
        404: { description: "Lesson not found" },
        500: { description: "Server error" },
      },
    },
  },
};
