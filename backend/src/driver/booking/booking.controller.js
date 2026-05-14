import { bookingService } from "./booking.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class BookingController {
  createBooking = catchAsync(async (req, res) => {
    const result = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json(result);
  });

  getDriverBookings = catchAsync(async (req, res) => {
    const bookings = await bookingService.getDriverBookings(req.user.id);
    res.json({ success: true, data: bookings, message: "Bookings retrieved successfully" });
  });

  getBookingById = catchAsync(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id);
    res.json({ success: true, data: booking, message: "Booking details retrieved successfully" });
  });

  cancelBooking = catchAsync(async (req, res) => {
    const result = await bookingService.cancelBooking(req.params.id, req.user.id);
    res.json(result);
  });
}

export const bookingController = new BookingController();
