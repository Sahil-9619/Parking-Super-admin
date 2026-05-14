import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Lot Super-Admin API",
      version: "1.0.0",
      description: "Production-ready Modular REST API documentation using Swagger and Zod Validation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Host Server",
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
  },
  apis: ["./src/**/*.routes.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
