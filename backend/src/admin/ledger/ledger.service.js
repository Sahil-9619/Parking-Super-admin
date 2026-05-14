import { ledgerRepository } from "./ledger.repository.js";

export class LedgerService {
  async getTransactionLedger(query) {
    const filters = {};
    if (query.userId) filters.userId = query.userId;
    if (query.type) filters.type = query.type;
    if (query.referenceType) filters.referenceType = query.referenceType;

    const ledger = await ledgerRepository.getTransactionAuditLedger(filters);
    return {
      success: true,
      data: ledger,
      message: "Transaction audit ledger retrieved successfully",
    };
  }
}

export const ledgerService = new LedgerService();
