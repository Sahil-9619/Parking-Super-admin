import crypto from "crypto";
import Razorpay from "razorpay";

import { walletRepository } from "./wallet.repository.js";
import { authRepository } from "../../common/auth/auth.repository.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Wallet top-up service backed by Razorpay.
 *
 * Two-step flow:
 *   1. createTopUpOrder(): asks Razorpay to create an Order for `amount`
 *      INR and returns its id back to the app so the Flutter SDK can open
 *      the checkout sheet.
 *   2. verifyAndCredit(): the SDK calls us back with a signed payload
 *      `(orderId, paymentId, signature)`. We re-compute the HMAC using
 *      our secret to verify it came from Razorpay, then credit the
 *      wallet in a single Prisma transaction.
 *
 * Why HMAC verify rather than trusting the client: the SDK runs in the
 * user's process and can lie, but only Razorpay knows the secret used to
 * sign `${orderId}|${paymentId}`. If our locally-recomputed signature
 * matches, the payment really happened.
 */
class WalletService {
  constructor() {
    this._client = null;
  }

  /** Lazy because env vars are loaded after import in some test setups. */
  _gateway() {
    if (this._client) return this._client;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new AppError(
        "Razorpay is not configured on the server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        503,
      );
    }
    this._client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return this._client;
  }

  async listTxns(userId, query) {
    const txns = await walletRepository.findTxnsByUser(userId, query);
    return txns;
  }

  async createTopUpOrder(userId, { amount }) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError("Amount must be a positive number", 400);
    }
    if (amount > 100000) {
      throw new AppError("Top-up amount exceeds per-transaction limit", 400);
    }

    // Razorpay amounts are integer paise.
    const paise = Math.round(amount * 100);
    const receipt = `wallet_${userId.slice(0, 8)}_${Date.now()}`;
    const order = await this._gateway().orders.create({
      amount: paise,
      currency: "INR",
      receipt,
      notes: { userId, purpose: "wallet_top_up" },
    });

    return {
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount / 100,
      currency: order.currency,
      receipt: order.receipt,
    };
  }

  /**
   * Verifies the Razorpay signature and credits the wallet. Idempotent:
   * if the same `paymentId` was already credited, we just return the
   * existing balance without double-crediting.
   */
  async verifyAndCredit(userId, { orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) {
      throw new AppError("Missing Razorpay verification fields", 400);
    }
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new AppError(
        "Razorpay is not configured on the server.",
        503,
      );
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (expected !== signature) {
      throw new AppError("Invalid payment signature", 400);
    }

    // Fetch the order from Razorpay rather than trusting client-sent
    // amounts — that's the only way we know what was actually paid.
    const order = await this._gateway().orders.fetch(orderId);
    if (!order) throw new AppError("Order not found at gateway", 404);
    if (order.status !== "paid") {
      throw new AppError(
        `Order is in '${order.status}' state — payment not captured`,
        400,
      );
    }
    if (order.notes?.userId && order.notes.userId !== userId) {
      throw new AppError("Order belongs to a different user", 403);
    }

    const amount = order.amount / 100;

    // Idempotency: if this paymentId already credited the user, skip.
    const existing = await walletRepository.findTxnsByUser(userId, {
      limit: 50,
    });
    const already = existing.find(
      (t) => t.referenceId === paymentId && t.type === "credit",
    );
    if (already) {
      const user = await authRepository.findUserById(userId);
      return { user, txn: already, alreadyCredited: true };
    }

    const updatedUser = await walletRepository.creditWalletTransaction(
      userId,
      amount,
      {
        referenceId: paymentId,
        description: `Wallet top-up via Razorpay (order ${orderId})`,
      },
    );

    return { user: updatedUser, alreadyCredited: false };
  }
}

export const walletService = new WalletService();
