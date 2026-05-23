import express from "express";
import { parkingController } from "./parking.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import {
  createParkingSchema,
  updateParkingStatusSchema,
  configureSlotsSchema,
  configurePricingSchema,
} from "./parking.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/owner/parkings:
 *   get:
 *     summary: List Owner Parking Lots
 *     description: Retrieve all parking structures managed by the authenticated owner, including nested capacity slots and pricing rules.
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of parking lots retrieved successfully
 *   post:
 *     summary: Create New Parking Lot Listing
 *     description: Register a new parking location. The provided latitude and longitude are automatically converted into a PostGIS geography Point geometry for radius querying.
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, parkingType, address, latitude, longitude, openTime, closeTime, ownershipType, parkingAreaPics]
 *             properties:
 *               name: { type: string, example: "Metro Station Plaza Lot 1" }
 *               parkingType: { type: string, enum: [home, society, commercial, govt, municipality], example: "commercial" }
 *               address: { type: string, example: "Plot 42, Sector 18, Noida" }
 *               latitude: { type: number, example: 28.5700 }
 *               longitude: { type: number, example: 77.3200 }
 *               openTime: { type: string, example: "06:00" }
 *               closeTime: { type: string, example: "23:00" }
 *               is24hr: { type: boolean, example: false }
 *               addonsEnabled:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["car_wash", "ev_charging"]
 *               ownershipType: { type: string, enum: [owned, rental], example: "owned" }
 *               propertyPaper: { type: string, format: uri, example: "https://example.com/doc.pdf" }
 *               leaseAgreement: { type: string, format: uri, example: "https://example.com/lease.pdf" }
 *               parkingAreaPics:
 *                 type: array
 *                 items: { type: string, format: uri }
 *                 example: ["https://example.com/pic1.jpg"]
 *     responses:
 *       201:
 *         description: Parking lot created successfully
 */
router.get("/", parkingController.getParkings);
router.post("/", validate(createParkingSchema), parkingController.createParking);

/**
 * @openapi
 * /api/owner/parkings/{id}:
 *   get:
 *     summary: Get Parking Lot Configuration Details
 *     description: Retrieve specific parking lot parameters, slots, and pricing rules.
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Details retrieved successfully
 *   put:
 *     summary: Update Parking Lot Listing Details
 *     description: Modify name, address, coordinates, operating hours, or enabled add-on services.
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Metro Station Plaza Lot 1 Updated" }
 *               openTime: { type: string, example: "05:00" }
 *               closeTime: { type: string, example: "23:59" }
 *               ownershipType: { type: string, enum: [owned, rental], example: "owned" }
 *               propertyPaper: { type: string, format: uri, example: "https://example.com/doc.pdf" }
 *               leaseAgreement: { type: string, format: uri, example: "https://example.com/lease.pdf" }
 *               parkingAreaPics:
 *                 type: array
 *                 items: { type: string, format: uri }
 *                 example: ["https://example.com/pic1.jpg"]
 *     responses:
 *       200:
 *         description: Parking updated successfully
 *   delete:
 *     summary: Delete Parking Lot Listing
 *     description: Remove parking lot and its nested slots/pricing rules from platform.
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Parking lot deleted successfully
 */
router.get("/:id", parkingController.getParkingById);
router.put("/:id", validate(createParkingSchema), parkingController.updateParking);
router.delete("/:id", parkingController.deleteParking);

/**
 * @openapi
 * /api/owner/parkings/{id}/status:
 *   put:
 *     summary: Toggle Parking Lot Operating Status
 *     description: Switch parking lot status between active (searchable) and paused (temporarily closed).
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, paused, pending], example: "active" }
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put("/:id/status", validate(updateParkingStatusSchema), parkingController.updateStatus);

/**
 * @openapi
 * /api/owner/parkings/{id}/slots:
 *   post:
 *     summary: Configure Vehicle Capacity Slots
 *     description: Upsert the total capacity slots for a specific vehicle classification (Bike, Car, or Commercial). Available slots are automatically adjusted.
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleType, totalSlots]
 *             properties:
 *               vehicleType: { type: string, enum: [bike, car, commercial], example: "car" }
 *               totalSlots: { type: number, example: 50 }
 *     responses:
 *       200:
 *         description: Slots configured successfully
 */
router.post("/:id/slots", validate(configureSlotsSchema), parkingController.configureSlots);

/**
 * @openapi
 * /api/owner/parkings/{id}/pricing:
 *   post:
 *     summary: Configure Dynamic Pricing Rules
 *     description: Upsert hourly base price for weekday and weekend rates, along with optional peak hour surcharge rules.
 *     tags: [Owner Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleType, weekdayPrice, weekendPrice]
 *             properties:
 *               vehicleType: { type: string, enum: [bike, car, commercial], example: "car" }
 *               weekdayPrice: { type: number, example: 40.00 }
 *               weekendPrice: { type: number, example: 60.00 }
 *               peakRules:
 *                 type: object
 *                 example: { "18:00-21:00": { "multiplier": 1.5 } }
 *     responses:
 *       200:
 *         description: Pricing configured successfully
 */
router.post("/:id/pricing", validate(configurePricingSchema), parkingController.configurePricing);

export default router;
