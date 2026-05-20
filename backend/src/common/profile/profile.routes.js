import express from "express";
import { profileController } from "./profile.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { updateProfileSchema } from "./profile.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Retrieve User Profile & Wallet Balance
 *     description: Fetch complete user profile details including wallet balance, status, and creation date.
 *     tags: [Profile]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, example: "usr_123" }
 *                     name: { type: string, example: "Rajesh Kumar" }
 *                     email: { type: string, example: "rajesh@example.com" }
 *                     walletBalance: { type: number, example: 250.50 }
 *   put:
 *     summary: Update User Profile Details
 *     description: Modify name, email, or phone of the authenticated user.
 *     tags: [Profile]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Rajesh Sharma" }
 *               email: { type: string, example: "sharma.r@example.com" }
 *               phone: { type: string, example: "9876543210" }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.get("/", profileController.getProfile);
router.put("/", validate(updateProfileSchema), profileController.updateProfile);

export default router;
