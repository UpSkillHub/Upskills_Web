import authPaths from "./paths/auth.js";
import userPaths from "./paths/users.js";
import coursePaths from "./paths/courses.js";
import modulePaths from "./paths/modules.js";
import lessonPaths from "./paths/lessons.js";
import enrollmentPaths from "./paths/enrollments.js";
import paymentPaths from "./paths/payments.js";
import reportPaths from "./paths/reports.js";
import teamPaths from "./paths/teams.js";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "UP SKILLS HUB API",
    version: "1.0.0",
    description:
      "Comprehensive API documentation for UP SKILLS HUB Learning Management System",
    contact: {
      name: "UP SKILLS HUB Team",
      email: "support@upskillshub.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:7000/api",
      description: "Development Server",
    },
    {
      url: "https://api.upskillshub.com/api",
      description: "Production Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "John Doe" },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          role: {
            type: "string",
            enum: ["admin", "trainer", "student"],
            example: "student",
          },
          profile_picture: {
            type: "string",
            example: "https://example.com/profile.jpg",
          },
          phone: { type: "string", example: "+250788123456" },
          bio: { type: "string", example: "Student at UP SKILLS HUB" },
          is_active: { type: "boolean", example: true },
          email_verified: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Course: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string", example: "Introduction to Programming" },
          description: {
            type: "string",
            example: "Learn the basics of programming",
          },
          price: { type: "number", format: "float", example: 49.99 },
          is_published: { type: "boolean", example: true },
          trainer_id: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Module: {
        type: "object",
        properties: {
          id: { type: "integer" },
          course_id: { type: "integer" },
          title: { type: "string", example: "Module 1: Basics" },
          description: { type: "string", example: "Introduction to basics" },
          order: { type: "integer", example: 0 },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Lesson: {
        type: "object",
        properties: {
          id: { type: "integer" },
          module_id: { type: "integer" },
          title: { type: "string", example: "Lesson 1: Variables" },
          content: { type: "string", example: "Learn about variables" },
          video_url: {
            type: "string",
            example: "https://example.com/video.mp4",
          },
          duration: { type: "integer", example: 15 },
          order: { type: "integer", example: 0 },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Enrollment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          course_id: { type: "integer" },
          status: {
            type: "string",
            enum: ["active", "completed", "dropped"],
            example: "active",
          },
          progress: { type: "integer", minimum: 0, maximum: 100, example: 0 },
          enrolled_at: { type: "string", format: "date-time" },
          completed_at: { type: "string", format: "date-time" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          course_id: { type: "integer" },
          amount: { type: "number", format: "float", example: 49.99 },
          currency: { type: "string", example: "USD" },
          status: {
            type: "string",
            enum: ["pending", "completed", "failed", "refunded"],
            example: "pending",
          },
          payment_method: { type: "string", example: "card" },
          transaction_id: { type: "string", example: "TXN-1234567890" },
          paid_at: { type: "string", format: "date-time" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Report: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          course_id: { type: "integer" },
          title: { type: "string", example: "Weekly Report Week 1" },
          content: { type: "string", example: "This week I learned..." },
          status: {
            type: "string",
            enum: ["draft", "submitted", "reviewed", "approved", "rejected"],
            example: "submitted",
          },
          submitted_at: { type: "string", format: "date-time" },
          reviewed_at: { type: "string", format: "date-time" },
          reviewer_comment: { type: "string", example: "Great work!" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Team: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", example: "Team Alpha" },
          description: { type: "string", example: "Frontend development team" },
          created_by: { type: "integer" },
          course_id: { type: "integer" },
          is_active: { type: "boolean", example: true },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User management endpoints" },
    { name: "Courses", description: "Course management endpoints" },
    { name: "Modules", description: "Module management endpoints" },
    { name: "Lessons", description: "Lesson management endpoints" },
    { name: "Enrollments", description: "Enrollment management endpoints" },
    { name: "Payments", description: "Payment processing endpoints" },
    { name: "Reports", description: "Report management endpoints" },
    { name: "Teams", description: "Team management endpoints" },
  ],
  paths: {
    ...authPaths,
    ...userPaths,
    ...coursePaths,
    ...modulePaths,
    ...lessonPaths,
    ...enrollmentPaths,
    ...paymentPaths,
    ...reportPaths,
    ...teamPaths,
  },
};

export default swaggerDocument;
