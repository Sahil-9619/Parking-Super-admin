import { ledgerService } from "./ledger.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class LedgerController {
  getTransactionLedger = catchAsync(async (req, res) => {
    const result = await ledgerService.getTransactionLedger(req.query);
    res.json(result);
  });
}

export const ledgerController = new LedgerController();
