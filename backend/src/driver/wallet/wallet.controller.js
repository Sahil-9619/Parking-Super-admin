import { walletService } from "./wallet.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class WalletController {
  listTxns = catchAsync(async (req, res) => {
    const txns = await walletService.listTxns(req.user.id, req.query);
    res.json({
      success: true,
      data: txns,
      message: "Wallet transactions retrieved successfully",
    });
  });

  createTopUpOrder = catchAsync(async (req, res) => {
    const data = await walletService.createTopUpOrder(req.user.id, {
      amount: Number(req.body.amount),
    });
    res.status(201).json({
      success: true,
      data,
      message: "Top-up order created",
    });
  });

  verifyTopUp = catchAsync(async (req, res) => {
    const result = await walletService.verifyAndCredit(req.user.id, {
      orderId: req.body.orderId,
      paymentId: req.body.paymentId,
      signature: req.body.signature,
    });
    res.json({
      success: true,
      data: {
        user: result.user,
        alreadyCredited: result.alreadyCredited,
      },
      message: result.alreadyCredited
        ? "Payment already credited"
        : "Wallet topped up successfully",
    });
  });
}

export const walletController = new WalletController();
