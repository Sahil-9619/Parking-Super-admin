import express from "express";
import { uploadController } from "./upload.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/upload/presigned-url:
 *   get:
 *     summary: Generate Cloudflare R2 Presigned PUT URL
 *     description: Request a secure, pre-authorized PUT URL to upload media files (parking photos, QR codes) directly from frontend client to Cloudflare R2 object storage.
 *     tags: [Media Upload]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         example: "lot_entrance.jpg"
 *         description: Original name of the file being uploaded
 *       - in: query
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *         example: "image/jpeg"
 *         description: MIME type of the file (e.g. image/jpeg, image/png)
 *     responses:
 *       200:
 *         description: Presigned URL and Public Read URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     presignedUrl: { type: string, example: "https://<ACCOUNT_ID>.r2.cloudflarestorage.com/parkpal-media/parkings/uuid.jpg?AWSAccessKeyId=..." }
 *                     publicUrl: { type: string, example: "https://cdn.parkpal.com/parkings/uuid.jpg" }
 *                     expiresIn: { type: number, example: 3600 }
 */
router.get("/presigned-url", uploadController.getPresignedUrl);

export default router;
