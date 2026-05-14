import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

// Auto-inject secure HTTP Response Headers against standard injection vectors
app.use(helmet());

// Cross-Origin Resource Sharing layer
app.use(cors());

// Parse structured incoming JSON payloads
app.use(express.json());

// Console stream HTTP Request/Response logger
app.use(morgan("dev"));

// DDoS and Brute-Force prevention interceptor limiting IP request quotas
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Maximum 100 API requests per IP window interval
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests originating from this IP address. Please wait 15 minutes before retrying.",
  },
});

// Enforce token-bucket quota limitation strictly across programmatic routes
app.use("/api", apiLimiter);

// OpenAPI Interactive Documentation Interface viewable via web clients
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Core Application Slices
app.use("/api/auth", authRoutes);

// Platform System Readiness Check Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Production-ready Modular Backend running securely 🚀",
    docs: "/api-docs",
  });
});

// Centralized Unhandled Exception Interceptor
app.use((err, req, res, next) => {
  console.error("Global Error Interceptor Log:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
