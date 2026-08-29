// swagger-jsdoc does not ship TypeScript declarations.
// @ts-expect-error -- use the package's JavaScript implementation.
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const swaggerDefinition = {
  openapi: "3.0.3",

  info: {
    title: "MedCore Hospital Management API",
    version: "1.0.0",
    description:
      "Backend API documentation for the MedCore Hospital Management Platform.",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
    {
      url: "https://medcore-hms-api-5v3l.onrender.com",
      description: "Production server",
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
  },

  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Convert Windows backslashes to forward slashes for glob matching
const apiPattern = path
  .resolve(process.cwd(), "src/modules/**/*.routes.ts")
  .replace(/\\/g, "/");

console.log("Swagger API pattern:", apiPattern);

const options = {
  definition: swaggerDefinition,
  apis: [apiPattern],
};

export const swaggerSpec = swaggerJsdoc(options);

console.log(
  "Swagger paths:",
  Object.keys(swaggerSpec.paths || {})
);