import express from "express";
import { bookingController } from "./booking.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { createBookingSchema } from "./booking.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/driver/bookings:
 *   get:
 *     summary: List Driver Past & Active Bookings
 *     description: Retrieve all booking records for the authenticated driver.
 *     tags: [Driver Booking]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 *   post:
 *     summary: Create Parking Booking & Generate QR Token
 *     description: Books a parking slot. Uses atomic FOR UPDATE PostgreSQL row locking to prevent concurrent double-bookings. Automatically deducts the gross amount from the driver's wallet and generates a secure QR Token.
 *     tags: [Driver Booking]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [parkingId, vehicleType, durationHours]
 *             properties:
 *               parkingId: { type: string, example: "uuid_parking_lot" }
 *               vehicleType: { type: string, enum: [bike, car, commercial], example: "car" }
 *               durationHours: { type: number, example: 2 }
 *               addonServices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     addonType: { type: string, enum: [car_wash, ev_charging, tyre_inflation], example: "car_wash" }
 *                     serviceLevel: { type: string, example: "basic" }
 *                     amount: { type: number, example: 150.00 }
 *     responses:
 *       201:
 *         description: Booking successful and QR Token generated
 */
router.get("/", bookingController.getDriverBookings);
router.post("/", validate(createBookingSchema), bookingController.createBooking);

/**
 * @openapi
 * /api/driver/bookings/{id}:
 *   get:
 *     summary: Get Booking Details & QR Code
 *     description: Fetch detailed booking structure including payment split and QR token string.
 *     tags: [Driver Booking]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 */
router.get("/:id", bookingController.getBookingById);

/**
 * @openapi
 * /api/driver/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel Booking & Refund Wallet
 *     description: Cancel a confirmed booking, release the locked parking slot, and refund the amount to the driver's wallet balance.
 *     tags: [Driver Booking]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled and refunded successfully
 */
router.put("/:id/cancel", bookingController.cancelBooking);

export default router;
