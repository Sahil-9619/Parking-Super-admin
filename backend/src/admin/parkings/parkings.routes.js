import express from "express";
import { parkingsController } from "./parkings.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/parkings:
 *   get:
 *     summary: Admin - List All Parking Areas
 *     description: Retrieve all parking areas with their owners and slot details.
 *     tags: [Admin Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All parkings retrieved successfully
 */
router.get("/", parkingsController.getAllParkings);

/**
 * @openapi
 * /api/admin/parkings/{id}/status:
 *   put:
 *     summary: Admin - Update Parking Area Status
 *     description: Update the status of a parking area (e.g. active, paused, banned).
 *     tags: [Admin Parking Management]
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
 *               status: { type: string, enum: [pending, active, paused, banned] }
 *     responses:
 *       200:
 *         description: Parking status updated successfully
 */
router.put("/:id/status", parkingsController.updateParkingStatus);
router.put("/:id", parkingsController.updateParking);
router.delete("/:id", parkingsController.deleteParking);

export default router;
