export const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
};

export const security = [
  {
    bearerAuth: [],
  },
];
