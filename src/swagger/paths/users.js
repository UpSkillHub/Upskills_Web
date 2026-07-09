export default {
  "/users": {
    get: {
      summary: "Get all users",
      description: "Returns a paginated list of all users. Admin only.",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number",
          schema: { type: "integer", default: 1 },
        },
        {
          name: "limit",
          in: "query",
          description: "Items per page",
          schema: { type: "integer", default: 10 },
        },
        {
          name: "role",
          in: "query",
          description: "Filter by role",
          schema: { type: "string", enum: ["admin", "trainer", "student"] },
        },
        {
          name: "is_active",
          in: "query",
          description: "Filter by active status",
          schema: { type: "boolean" },
        },
      ],
      responses: {
        200: {
          description: "Users retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      users: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
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
        403: { description: "Forbidden - Admin only" },
        500: { description: "Server error" },
      },
    },
  },

  "/users/stats": {
    get: {
      summary: "Get user statistics",
      description: "Returns counts of users by role. Admin only.",
      tags: ["Users"],
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
                      roles: {
                        type: "object",
                        properties: {
                          student: { type: "integer" },
                          trainer: { type: "integer" },
                          admin: { type: "integer" },
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
        403: { description: "Forbidden - Admin only" },
        500: { description: "Server error" },
      },
    },
  },

  "/users/{id}": {
    get: {
      summary: "Get user by ID",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "User ID",
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "User retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: {
          description: "Forbidden - Can only view own profile or be admin",
        },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
    put: {
      summary: "Update user",
      description: "Update user details. Admin only.",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "User ID",
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Updated Name" },
                email: {
                  type: "string",
                  format: "email",
                  example: "updated@example.com",
                },
                role: { type: "string", enum: ["admin", "trainer", "student"] },
                phone: { type: "string", example: "+250788999999" },
                bio: { type: "string", example: "Updated bio" },
                is_active: { type: "boolean", example: true },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "User updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "User updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      summary: "Soft delete user",
      description: "Deactivate a user account. Admin only.",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "User ID",
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "User deactivated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "User deactivated successfully",
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/users/{id}/permanent": {
    delete: {
      summary: "Hard delete user",
      description: "Permanently delete a user. Admin only.",
      tags: ["Users"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "User ID",
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "User permanently deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "User permanently deleted successfully",
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
  },
};
