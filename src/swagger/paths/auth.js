export default {
  "/auth/register": {
    post: {
      summary: "Register a new user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string", example: "John Doe" },
                email: {
                  type: "string",
                  format: "email",
                  example: "john@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "Password123",
                },
                phone: { type: "string", example: "+250788123456" },
                bio: { type: "string", example: "Student at UP SKILLS HUB" },
                role: {
                  type: "string",
                  enum: ["admin", "trainer", "student"],
                  example: "student",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "User registered successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                      accessToken: { type: "string" },
                      refreshToken: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or user already exists",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        500: {
          description: "Server error",
        },
      },
    },
  },

  "/auth/login": {
    post: {
      summary: "Login user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "john@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "Password123",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful" },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                      accessToken: { type: "string" },
                      refreshToken: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Invalid credentials",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },

  "/auth/refresh": {
    post: {
      summary: "Refresh access token",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["refreshToken"],
              properties: {
                refreshToken: {
                  type: "string",
                  example: "your-refresh-token-here",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Token refreshed successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Invalid or expired refresh token",
        },
      },
    },
  },

  "/auth/me": {
    get: {
      summary: "Get current user profile",
      tags: ["Auth"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "User profile retrieved",
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
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },

  "/auth/logout": {
    post: {
      summary: "Logout user",
      tags: ["Auth"],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Logged out successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Logged out successfully",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Server error",
        },
      },
    },
  },

  "/auth/profile": {
    put: {
      summary: "Update user profile",
      tags: ["Auth"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "John Updated" },
                phone: { type: "string", example: "+250788999999" },
                bio: { type: "string", example: "Updated bio" },
                profile_picture: {
                  type: "string",
                  example: "https://example.com/new-profile.jpg",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Profile updated successfully",
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
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },

  "/auth/change-password": {
    put: {
      summary: "Change password",
      tags: ["Auth"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentPassword", "newPassword"],
              properties: {
                currentPassword: {
                  type: "string",
                  format: "password",
                  example: "Password123",
                },
                newPassword: {
                  type: "string",
                  format: "password",
                  example: "NewPassword456",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Password updated successfully",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Current password is incorrect",
        },
        500: {
          description: "Server error",
        },
      },
    },
  },
};
