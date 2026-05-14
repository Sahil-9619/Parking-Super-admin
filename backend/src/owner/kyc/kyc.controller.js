import { kycService } from "./kyc.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class KycController {
  getProfile = catchAsync(async (req, res) => {
    const profile = await kycService.getProfile(req.user.id);
    res.json({ success: true, data: profile, message: "Owner profile retrieved successfully" });
  });

  updateProfile = catchAsync(async (req, res) => {
    const updated = await kycService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: updated, message: "Owner profile updated successfully" });
  });

  updateBankDetails = catchAsync(async (req, res) => {
    const result = await kycService.updateBankDetails(req.user.id, req.body);
    res.json(result);
  });

  getBankDetails = catchAsync(async (req, res) => {
    const details = await kycService.getBankDetails(req.user.id);
    res.json(details);
  });
}

export const kycController = new KycController();
