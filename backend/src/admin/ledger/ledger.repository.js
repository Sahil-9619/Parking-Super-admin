import { prisma } from "../../../config/prisma.js";

export class LedgerRepository {
  async getTransactionAuditLedger(filters) {
    return await prisma.walletTxn.findMany({
      where: filters,
      include: {
        user: {
          select: { name: true, phone: true, email: true, userType: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const ledgerRepository = new LedgerRepository();
