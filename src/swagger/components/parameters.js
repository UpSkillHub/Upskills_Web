export const parameters = {
  page: {
    name: "page",
    in: "query",
    description: "Page number for pagination",
    schema: { type: "integer", default: 1 },
  },
  limit: {
    name: "limit",
    in: "query",
    description: "Number of items per page",
    schema: { type: "integer", default: 10 },
  },
  id: {
    name: "id",
    in: "path",
    description: "ID of the resource",
    required: true,
    schema: { type: "integer" },
  },
  userId: {
    name: "userId",
    in: "path",
    description: "ID of the user",
    required: true,
    schema: { type: "integer" },
  },
  courseId: {
    name: "courseId",
    in: "path",
    description: "ID of the course",
    required: true,
    schema: { type: "integer" },
  },
};
