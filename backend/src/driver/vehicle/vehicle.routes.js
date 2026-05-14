import express from "express";
import { vehicleController } from "./vehicle.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { addVehicleSchema, updateVehicleSchema } from "./vehicle.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/driver/vehicles:
 *   get:
 *     summary: List Driver Vehicles
 *     description: Retrieve all vehicles registered by the authenticated driver, ordered by most recently added.
 *     tags: [Driver Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of vehicles retrieved successfully
 *   post:
 *     summary: Add New Vehicle
 *     description: Register a new vehicle (Bike, Car, or Commercial) under the driver profile.
 *     tags: [Driver Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [regNumber, vehicleType]
 *             properties:
 *               regNumber: { type: string, example: "DL-10-CB-1234" }
 *               vehicleType: { type: string, enum: [bike, car, commercial], example: "car" }
 *     responses:
 *       201:
 *         description: Vehicle added successfully
 */
router.get("/", vehicleController.getVehicles);
router.post("/", validate(addVehicleSchema), vehicleController.addVehicle);

/**
 * @openapi
 * /api/driver/vehicles/{id}:
 *   put:
 *     summary: Update Vehicle Registration Number
 *     description: Modify the registration plate string of a specific vehicle ID.
 *     tags: [Driver Vehicles]
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
 *             required: [regNumber]
 *             properties:
 *               regNumber: { type: string, example: "HR-26-DQ-5555" }
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *   delete:
 *     summary: Remove Vehicle
 *     description: Delete a registered vehicle from driver profile.
 *     tags: [Driver Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehicle removed successfully
 */
router.put("/:id", validate(updateVehicleSchema), vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

/**
 * @openapi
 * /api/driver/vehicles/{id}/set-active:
 *   put:
 *     summary: Set Active Vehicle for Map Search Filtering
 *     description: Toggles the specified vehicle as currently active. All other vehicles for this user are unset. Map search queries automatically filter parking slots matching the active vehicle type.
 *     tags: [Driver Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Active vehicle set successfully
 */
router.put("/:id/set-active", vehicleController.setActiveVehicle);

export default router;
