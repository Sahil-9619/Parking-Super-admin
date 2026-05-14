import express from "express";
import { addonsController } from "./addons.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { configureAddonsSchema, updateAddonStatusSchema, createCustomAddonSchema } from "./addons.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/owner/addons/{parkingId}:
 *   put:
 *     summary: Configure Enabled Add-on Tags
 *     description: Define which quick add-on tag strings are available at this parking location.
 *     tags: [Owner Add-on Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: parkingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addonsEnabled]
 *             properties:
 *               addonsEnabled:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["car_wash", "ev_charging"]
 *     responses:
 *       200:
 *         description: Add-ons tags configured successfully
 */
router.put("/:parkingId", validate(configureAddonsSchema), addonsController.configureAddons);

/**
 * @openapi
 * /api/owner/addons/{parkingId}/custom:
 *   get:
 *     summary: List Dynamic Custom Add-on Services
 *     description: Retrieve all custom add-on services created by the owner for this parking lot.
 *     tags: [Owner Add-on Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: parkingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Custom add-ons retrieved successfully
 *   post:
 *     summary: Create Dynamic Custom Add-on Service
 *     description: Owner creates a custom add-on service with pricing, description, and image URL.
 *     tags: [Owner Add-on Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: parkingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: "VIP Valet Parking" }
 *               price: { type: number, example: 150.00 }
 *               description: { type: string, example: "Personal valet driver at entrance" }
 *               image: { type: string, example: "https://cdn.parkpal.com/valet.jpg" }
 *     responses:
 *       201:
 *         description: Custom add-on created successfully
 */
router.get("/:parkingId/custom", addonsController.getCustomAddons);
router.post("/:parkingId/custom", validate(createCustomAddonSchema), addonsController.createCustomAddon);

/**
 * @openapi
 * /api/owner/addons/custom/{addonId}:
 *   put:
 *     summary: Update Dynamic Custom Add-on Service
 *     description: Update pricing, description, or toggle active status of a custom add-on service.
 *     tags: [Owner Add-on Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addonId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price: { type: number, example: 200.00 }
 *               isActive: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/custom/:addonId", addonsController.updateCustomAddon);

/**
 * @openapi
 * /api/owner/addons/{parkingId}/bookings:
 *   get:
 *     summary: List Add-on Service Requests
 *     description: Retrieve all active and completed add-on service requests for a specific parking lot.
 *     tags: [Owner Add-on Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: parkingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of add-on requests retrieved successfully
 */
router.get("/:parkingId/bookings", addonsController.getAddonBookings);

/**
 * @openapi
 * /api/owner/addons/bookings/{addonBookingId}/status:
 *   put:
 *     summary: Update Add-on Service Status
 *     description: Owner updates the progress state of an add-on request (e.g., marking a car wash as in_progress or completed).
 *     tags: [Owner Add-on Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addonBookingId
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
 *               status: { type: string, enum: [pending, in_progress, completed], example: "completed" }
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put("/bookings/:addonBookingId/status", validate(updateAddonStatusSchema), addonsController.updateAddonStatus);

export default router;
