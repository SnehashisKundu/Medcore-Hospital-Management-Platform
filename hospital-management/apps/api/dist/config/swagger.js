"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
// swagger-jsdoc does not ship TypeScript declarations.
// @ts-expect-error -- use the package's JavaScript implementation.
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const swaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: "MedCore Hospital Management API",
        version: "1.0.0",
        description: "Backend API documentation for the MedCore Hospital Management Platform.",
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
const apiPattern = path_1.default
    .resolve(process.cwd(), "src/modules/**/*.routes.ts")
    .replace(/\\/g, "/");
console.log("Swagger API pattern:", apiPattern);
const options = {
    definition: swaggerDefinition,
    apis: [apiPattern],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
console.log("Swagger paths:", Object.keys(exports.swaggerSpec.paths || {}));
