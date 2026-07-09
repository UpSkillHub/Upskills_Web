export default {
  "/modules": {
    post: {
      summary: "Create a module",
      tags: ["Modules"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["course_id", "title"],
              properties: {
                course_id: { type: "integer", example: 1 },
                title: { type: "string", example: "Module 1: Basics" },
                description: {
                  type: "string",
                  example: "Introduction to basics",
                },
                order: { type: "integer", example: 0 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Module created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Module created successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      module: { $ref: "#/components/schemas/Module" },
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

  "/modules/course/{courseId}": {
    get: {
      summary: "Get modules by course",
      tags: ["Modules"],
      parameters: [
        {
          name: "courseId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Modules retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      modules: {
                        type: "array",
                        items: {
                          allOf: [
                            { $ref: "#/components/schemas/Module" },
                            {
                              type: "object",
                              properties: {
                                lessons: {
                                  type: "array",
                                  items: {
                                    $ref: "#/components/schemas/Lesson",
                                  },
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
        },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/modules/{id}": {
    get: {
      summary: "Get module by ID",
      tags: ["Modules"],
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
          description: "Module retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      module: { $ref: "#/components/schemas/Module" },
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
    put: {
      summary: "Update a module",
      tags: ["Modules"],
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
                title: { type: "string", example: "Updated Module Title" },
                description: { type: "string", example: "Updated description" },
                order: { type: "integer", example: 1 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Module updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Module updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      module: { $ref: "#/components/schemas/Module" },
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
        404: { description: "Module not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      summary: "Delete a module",
      tags: ["Modules"],
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
          description: "Module deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Module deleted successfully",
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
        404: { description: "Module not found" },
        500: { description: "Server error" },
      },
    },
  },
};
