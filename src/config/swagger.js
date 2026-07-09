import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger/index.js";

export const serve = swaggerUi.serve;
export const setup = swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "UP SKILLS HUB API Documentation",
});
