import express from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { loginSchema } from "./auth.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate master administrator
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@parkadda.com
 *               password:
 *                 type: string
 *                 example: admin@parkadda
 *     responses:
 *       200:
 *         description: Authentication successful returning signed JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       400:
 *         description: Validation error array format returned by Zod interceptor
 *       401:
 *         description: Unauthorized credential matching failure
 */
router.post("/login", validate(loginSchema), authController.loginAdmin);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Retrieve verified super-admin identity profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Secure identity context payload returned
 *       401:
 *         description: Token absent or malformed header
 *       403:
 *         description: Token invalid signature verification failed
 */
router.get("/profile", verifyToken, authController.getProfile);

export default router;
