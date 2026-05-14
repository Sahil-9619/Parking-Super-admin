import { disputesRepository } from "./disputes.repository.js";
import { AppError } from "../../utils/AppError.js";

export class DisputesService {
  async getDisputes() {
    const disputes = await disputesRepository.findDisputes();
    return {
      success: true,
      data: disputes,
      message: "Disputes retrieved successfully",
    };
  }

  async resolveDispute(disputeId, { resolution, refundAmount, adminNote }) {
    const dispute = await disputesRepository.findDisputeById(disputeId);
    if (!dispute) throw new AppError("Dispute ticket not found", 404);

    if (dispute.status === "resolved") {
      throw new AppError("Dispute ticket is already resolved", 400);
    }

    const amount = refundAmount ? parseFloat(refundAmount) : 0;
    const resolved = await disputesRepository.resolveDisputeTransaction(
      disputeId,
      dispute.bookingId,
      dispute.booking.userId,
      resolution,
      amount,
      adminNote
    );

    return {
      success: true,
      data: resolved,
      message: `Dispute ticket resolved successfully with resolution '${resolution}'`,
    };
  }
}

export const disputesService = new DisputesService();
