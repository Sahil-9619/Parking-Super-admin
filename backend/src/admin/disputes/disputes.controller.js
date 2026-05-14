import { disputesService } from "./disputes.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class DisputesController {
  getDisputes = catchAsync(async (req, res) => {
    const result = await disputesService.getDisputes();
    res.json(result);
  });

  resolveDispute = catchAsync(async (req, res) => {
    const result = await disputesService.resolveDispute(req.params.id, req.body);
    res.json(result);
  });
}

export const disputesController = new DisputesController();
