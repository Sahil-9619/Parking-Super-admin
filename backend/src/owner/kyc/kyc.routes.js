import express from "express";
import { kycController } from "./kyc.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { updateOwnerProfileSchema, updateBankDetailsSchema } from "./kyc.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/owner/kyc/profile:
 *   get:
 *     summary: Get Owner KYC Profile & Strike Count
 *     description: Retrieve owner business category, GST verification status, and penalty strike count.
 *     tags: [Owner KYC & Banking]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Owner profile retrieved successfully
 *   put:
 *     summary: Update Owner Business KYC Details
 *     description: Modify owner business name, business classification type, or GST identification number.
 *     tags: [Owner KYC & Banking]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "City Center Parking Corp" }
 *               ownerType: { type: string, enum: [home, society, commercial, govt, municipality], example: "commercial" }
 *               gstNumber: { type: string, example: "07AAAAA0000A1Z5" }
 *               globalTermsAccepted: { type: boolean, example: true, description: "Must be true when accepting the global platform terms and conditions for onboarding." }
 *     responses:
 *       200:
 *         description: Owner profile updated successfully
 */
router.get("/profile", kycController.getProfile);
router.put("/profile", validate(updateOwnerProfileSchema), kycController.updateProfile);

/**
 * @openapi
 * /api/owner/kyc/bank-details:
 *   get:
 *     summary: Retrieve Masked Bank Credentials
 *     description: Securely fetches stored bank details, displaying only the last 4 digits of the account number for security compliance.
 *     tags: [Owner KYC & Banking]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Masked bank details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accountLast4: { type: string, example: "4321" }
 *                     bankIfsc: { type: string, example: "HDFC0001234" }
 *                     accountHolderName: { type: string, example: "City Center Parking Corp" }
 *                     aadharNumber: { type: string, example: "123456789012" }
 *                     aadharPic: { type: string, example: "https://example.com/aadhar.jpg" }
 *   put:
 *     summary: Secure Storage of Encrypted Bank Credentials
 *     description: Stores bank account details. Account number and IFSC code are automatically encrypted at rest using AES-256-CBC encryption algorithms.
 *     tags: [Owner KYC & Banking]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bankAccount, bankIfsc, accountHolderName, aadharNumber, aadharPic]
 *             properties:
 *               bankAccount: { type: string, example: "50100234567890" }
 *               bankIfsc: { type: string, example: "HDFC0001234" }
 *               accountHolderName: { type: string, example: "City Center Parking Corp" }
 *               aadharNumber: { type: string, example: "123456789012" }
 *               aadharPic: { type: string, example: "https://example.com/aadhar.jpg" }
 *     responses:
 *       200:
 *         description: Bank details encrypted and stored successfully
 */
router.get("/bank-details", kycController.getBankDetails);
router.put("/bank-details", validate(updateBankDetailsSchema), kycController.updateBankDetails);

export default router;
