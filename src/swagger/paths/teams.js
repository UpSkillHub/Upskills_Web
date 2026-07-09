export default {
  "/teams": {
    post: {
      summary: "Create a team",
      description: "Create a new team. Admin only.",
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Team Alpha" },
                description: {
                  type: "string",
                  example: "Frontend development team",
                },
                course_id: { type: "integer", example: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Team created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Team created successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      team: { $ref: "#/components/schemas/Team" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Course not found" },
        500: { description: "Server error" },
      },
    },
    get: {
      summary: "Get all teams",
      description: "Returns all teams. Admin or Trainer.",
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "course_id",
          in: "query",
          schema: { type: "integer" },
        },
        {
          name: "is_active",
          in: "query",
          schema: { type: "boolean" },
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
          description: "Teams retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      teams: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Team" },
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
        403: { description: "Forbidden - Admin or Trainer only" },
        500: { description: "Server error" },
      },
    },
  },

  "/teams/{id}": {
    get: {
      summary: "Get team by ID",
      description: "Returns team details with members. Admin or Trainer.",
      tags: ["Teams"],
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
          description: "Team retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      team: {
                        allOf: [
                          { $ref: "#/components/schemas/Team" },
                          {
                            type: "object",
                            properties: {
                              creator: { $ref: "#/components/schemas/User" },
                              course: { $ref: "#/components/schemas/Course" },
                              members: {
                                type: "array",
                                items: { $ref: "#/components/schemas/User" },
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
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin or Trainer only" },
        404: { description: "Team not found" },
        500: { description: "Server error" },
      },
    },
    put: {
      summary: "Update a team",
      description: "Update team details. Admin only.",
      tags: ["Teams"],
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
                name: { type: "string", example: "Team Beta" },
                description: { type: "string", example: "Updated description" },
                course_id: { type: "integer", example: 2 },
                is_active: { type: "boolean", example: false },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Team updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Team updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      team: { $ref: "#/components/schemas/Team" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Team not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      summary: "Delete a team",
      description: "Delete a team. Admin only.",
      tags: ["Teams"],
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
          description: "Team deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Team deleted successfully",
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Team not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/teams/{id}/members": {
    post: {
      summary: "Add member to team",
      description: "Add a user to a team. Admin only.",
      tags: ["Teams"],
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
              required: ["user_id"],
              properties: {
                user_id: { type: "integer", example: 5 },
                role: {
                  type: "string",
                  enum: ["lead", "member"],
                  example: "member",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Member added to team",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Member added to team successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      teamMember: {
                        type: "object",
                        properties: {
                          team_id: { type: "integer" },
                          user_id: { type: "integer" },
                          role: { type: "string" },
                          joined_at: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "User already in team" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Team or user not found" },
        500: { description: "Server error" },
      },
    },
    get: {
      summary: "Get team members",
      description: "Returns all members of a team. Admin or Trainer.",
      tags: ["Teams"],
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
          description: "Team members retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      members: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "integer" },
                            team_id: { type: "integer" },
                            user_id: { type: "integer" },
                            role: { type: "string", enum: ["lead", "member"] },
                            joined_at: { type: "string", format: "date-time" },
                            user: { $ref: "#/components/schemas/User" },
                          },
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
        403: { description: "Forbidden - Admin or Trainer only" },
        404: { description: "Team not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/teams/{id}/members/{userId}": {
    delete: {
      summary: "Remove member from team",
      description: "Remove a user from a team. Admin only.",
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Member removed from team",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Member removed from team successfully",
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Team or member not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/teams/{id}/members/{userId}/role": {
    put: {
      summary: "Update member role",
      description: "Update a team member's role (lead/member). Admin only.",
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
        {
          name: "userId",
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
              required: ["role"],
              properties: {
                role: {
                  type: "string",
                  enum: ["lead", "member"],
                  example: "lead",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Member role updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Member role updated successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      team_id: { type: "integer" },
                      user_id: { type: "integer" },
                      role: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin only" },
        404: { description: "Team or member not found" },
        500: { description: "Server error" },
      },
    },
  },

  "/teams/user/{userId}": {
    get: {
      summary: "Get teams by user",
      description: "Returns all teams a user belongs to. Admin or Trainer.",
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: {
          description: "Teams retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      teams: {
                        type: "array",
                        items: {
                          allOf: [
                            { $ref: "#/components/schemas/Team" },
                            {
                              type: "object",
                              properties: {
                                TeamMember: {
                                  type: "object",
                                  properties: {
                                    role: { type: "string" },
                                    joined_at: {
                                      type: "string",
                                      format: "date-time",
                                    },
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
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin or Trainer only" },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
  },
};
