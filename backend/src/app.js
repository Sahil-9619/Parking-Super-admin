import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";
import authRoutes from "./common/auth/auth.routes.js";
import profileRoutes from "./common/profile/profile.routes.js";
import uploadRoutes from "./common/upload/upload.routes.js";
import driverVehicleRoutes from "./driver/vehicle/vehicle.routes.js";
import driverParkingSearchRoutes from "./driver/parking-search/parking-search.routes.js";
import driverBookingRoutes from "./driver/booking/booking.routes.js";
import ownerKycRoutes from "./owner/kyc/kyc.routes.js";
import ownerParkingRoutes from "./owner/parking/parking.routes.js";
import ownerAddonRoutes from "./owner/addons/addons.routes.js";
import ownerBookingRoutes from "./owner/booking/booking.routes.js";
import adminRoutes from "./admin/index.js";

const app = express();

// Auto-inject secure HTTP Response Headers against standard injection vectors
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: false,
}));

// Cross-Origin Resource Sharing layer
app.use(cors());

// Parse structured incoming JSON payloads
app.use(express.json());

// Console stream HTTP Request/Response logger
app.use(morgan("dev"));

// DDoS and Brute-Force prevention interceptor limiting IP request quotas
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Increased to 1000 for development/dashboard polling
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
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/driver/vehicles", driverVehicleRoutes);
app.use("/api/driver/parkings", driverParkingSearchRoutes);
app.use("/api/driver/bookings", driverBookingRoutes);
app.use("/api/owner/kyc", ownerKycRoutes);
app.use("/api/owner/parkings", ownerParkingRoutes);
app.use("/api/owner/addons", ownerAddonRoutes);
app.use("/api/owner/bookings", ownerBookingRoutes);
app.use("/api/admin", adminRoutes);

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
