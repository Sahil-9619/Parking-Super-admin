import express from "express";
import { parkingSearchController } from "./parking-search.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { searchParkingSchema } from "./parking-search.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/driver/parkings/search:
 *   get:
 *     summary: PostGIS ST_DWithin Geographical Radius Search
 *     description: Searches for active, open parking lots within a specified radius (default 5km) of the driver's current coordinates. Automatically filters out lots that have 0 available slots for the selected vehicle type.
 *     tags: [Driver Parking Search]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema: { type: number }
 *         example: 28.5355
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema: { type: number }
 *         example: 77.2641
 *       - in: query
 *         name: radius
 *         required: false
 *         schema: { type: number, default: 5000 }
 *         example: 5000
 *         description: Search radius in meters
 *       - in: query
 *         name: vehicleType
 *         required: true
 *         schema: { type: string, enum: [bike, car, commercial] }
 *         example: "car"
 *     responses:
 *       200:
 *         description: Matching nearby parking lots returned with exact distances in meters and pricing details
 */
router.get("/search", validate(searchParkingSchema), parkingSearchController.searchNearbyParkings);

/**
 * @openapi
 * /api/driver/parkings/{id}:
 *   get:
 *     summary: Get Parking Lot Detail for Booking
 *     description: Returns detailed parking structure including available capacity slots and pricing rules matching the requested vehicle type.
 *     tags: [Driver Parking Search]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: vehicleType
 *         required: false
 *         schema: { type: string, enum: [bike, car, commercial], default: "car" }
 *         example: "car"
 *     responses:
 *       200:
 *         description: Parking details retrieved successfully
 */
router.get("/:id", parkingSearchController.getParkingDetails);

export default router;
