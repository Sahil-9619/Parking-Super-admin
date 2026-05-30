import { ownerBookingService } from "./booking.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class OwnerBookingController {
  list = catchAsync(async (req, res) => {
    const bookings = await ownerBookingService.listForOwner(req.user.id, req.query);
    res.json({ success: true, data: bookings, message: "Bookings retrieved successfully" });
  });

  summary = catchAsync(async (req, res) => {
    const totals = await ownerBookingService.summary(req.user.id);
    res.json({ success: true, data: totals, message: "Summary retrieved successfully" });
  });

  getById = catchAsync(async (req, res) => {
    const booking = await ownerBookingService.getById(req.params.id, req.user.id);
    res.json({ success: true, data: booking, message: "Booking retrieved successfully" });
  });
}

export const ownerBookingController = new OwnerBookingController();
