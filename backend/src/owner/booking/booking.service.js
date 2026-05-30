import { ownerBookingRepository } from "./booking.repository.js";
import { AppError } from "../../utils/AppError.js";

export class OwnerBookingService {
  async listForOwner(ownerId, query) {
    return ownerBookingRepository.findOwnerBookings(ownerId, query);
  }

  async getById(bookingId, ownerId) {
    const booking = await ownerBookingRepository.findOwnerBookingById(bookingId, ownerId);
    if (!booking) {
      throw new AppError("Booking not found or not in your inventory", 404);
    }
    return booking;
  }

  async summary(ownerId) {
    return ownerBookingRepository.summarize(ownerId);
  }
}

export const ownerBookingService = new OwnerBookingService();
