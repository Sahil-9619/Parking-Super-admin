import { prisma } from "../../../config/prisma.js";

export class WalletRepository {
  async findTxnsByUser(userId, { limit = 50, cursor } = {}) {
    return prisma.walletTxn.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: Math.min(parseInt(limit, 10) || 50, 200),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  /**
   * Credits the wallet inside a transaction so the balance update and
   * ledger row are committed atomically. Used after Razorpay's signature
   * verifies on a top-up callback.
   */
  async creditWalletTransaction(userId, amount, { referenceId, description }) {
    return prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      });

      await tx.walletTxn.create({
        data: {
          userId,
          type: "credit",
          amount,
          referenceId,
          referenceType: "razorpay_top_up",
          description,
          balanceAfter: updatedUser.walletBalance,
        },
      });

      return updatedUser;
    });
  }
}

export const walletRepository = new WalletRepository();
