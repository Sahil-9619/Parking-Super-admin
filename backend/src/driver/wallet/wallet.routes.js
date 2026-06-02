import express from "express";
import { walletController } from "./wallet.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { topUpOrderSchema, topUpVerifySchema } from "./wallet.schema.js";

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/driver/wallet/txns:
 *   get:
 *     summary: List Driver Wallet Transactions
 *     description: Returns the most recent wallet ledger entries for the authenticated driver.
 *     tags: [Driver Wallet]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 200 }
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get("/txns", walletController.listTxns);

/**
 * @openapi
 * /api/driver/wallet/top-up/order:
 *   post:
 *     summary: Create Razorpay Wallet Top-up Order
 *     description: Creates a Razorpay order for the requested top-up amount (INR) and returns the order id + publishable key for the Flutter SDK to open the checkout sheet.
 *     tags: [Driver Wallet]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 500.0 }
 *     responses:
 *       201:
 *         description: Top-up order created successfully
 */
router.post(
  "/top-up/order",
  validate(topUpOrderSchema),
  walletController.createTopUpOrder,
);

/**
 * @openapi
 * /api/driver/wallet/top-up/verify:
 *   post:
 *     summary: Verify Razorpay Top-up Payment & Credit Wallet
 *     description: Verifies the Razorpay signature returned by the gateway SDK and credits the user's wallet on success. Idempotent — repeated calls with the same paymentId only credit once.
 *     tags: [Driver Wallet]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, paymentId, signature]
 *             properties:
 *               orderId: { type: string }
 *               paymentId: { type: string }
 *               signature: { type: string }
 *     responses:
 *       200:
 *         description: Wallet credited successfully
 */
router.post(
  "/top-up/verify",
  validate(topUpVerifySchema),
  walletController.verifyTopUp,
);

export default router;
