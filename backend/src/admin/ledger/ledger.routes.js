import express from "express";
import { ledgerController } from "./ledger.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/logs/transactions:
 *   get:
 *     summary: Admin - Transaction Audit Ledger
 *     description: Immutable financial audit log showing complete credit, debit, refund, and payout ledgers across the entire system.
 *     tags: [Admin Transaction Ledger]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         example: "uuid_user_id"
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [credit, debit, refund, overstay_charge, payout] }
 *         example: "debit"
 *       - in: query
 *         name: referenceType
 *         schema: { type: string }
 *         example: "booking"
 *     responses:
 *       200:
 *         description: Ledger retrieved successfully
 */
router.get("/", ledgerController.getTransactionLedger);

export default router;
