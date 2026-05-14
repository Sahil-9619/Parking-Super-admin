import crypto from "crypto";
import { bookingRepository } from "./booking.repository.js";
import { authRepository } from "../../common/auth/auth.repository.js";
import { AppError } from "../../utils/AppError.js";

export class BookingService {
  async createBooking(userId, { parkingId, vehicleType, durationHours, addonServices }) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    const parking = await bookingRepository.getParkingWithPricingAndSlots(parkingId, vehicleType);
    if (!parking) throw new AppError("Parking lot not found", 404);

    if (parking.status !== "active") throw new AppError("Parking lot is currently unavailable", 400);

    if (!parking.slots || parking.slots.length === 0 || parking.slots[0].availableSlots <= 0) {
      throw new AppError("Parking space is fully booked for this vehicle type", 400);
    }

    if (!parking.pricingRules || parking.pricingRules.length === 0) {
      throw new AppError("Pricing rules not configured for this vehicle type", 400);
    }

    const platformSettings = await bookingRepository.getPlatformSettings();
    const commissionRate = parseFloat(platformSettings.platformCommissionRate);

    // Calculate base price
    const pricing = parking.pricingRules[0];
    const isWeekend = [0, 6].includes(new Date().getDay());
    const hourlyRate = isWeekend ? parseFloat(pricing.weekendPrice) : parseFloat(pricing.weekdayPrice);

    let baseAmount = hourlyRate * durationHours;

    // Add addons amount
    let addonAmount = 0;
    if (addonServices && addonServices.length > 0) {
      addonAmount = addonServices.reduce((sum, item) => sum + item.amount, 0);
    }

    const grossAmount = baseAmount + addonAmount;

    if (parseFloat(user.walletBalance) < grossAmount) {
      throw new AppError("Insufficient wallet balance. Please add money to your wallet.", 400);
    }

    const commission = grossAmount * commissionRate;
    const ownerShare = grossAmount * (1 - commissionRate);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    // Generate secure random QR token
    const qrToken = `QR_${crypto.randomBytes(16).toString("hex")}`;

    try {
      const booking = await bookingRepository.createBookingTransaction(
        userId,
        parkingId,
        vehicleType,
        startTime,
        endTime,
        grossAmount,
        commission,
        ownerShare,
        qrToken,
        addonServices,
        commissionRate
      );

      return {
        success: true,
        data: booking,
        message: "Parking space booked successfully. QR Token generated.",
      };
    } catch (error) {
      if (error.message === "PARKING_FULL") {
        throw new AppError("Parking space became fully booked during checkout", 400);
      }
      throw error;
    }
  }

  async getDriverBookings(userId) {
    return await bookingRepository.findDriverBookings(userId);
  }

  async getBookingById(id, userId) {
    const booking = await bookingRepository.findBookingByIdAndDriver(id, userId);
    if (!booking) throw new AppError("Booking not found", 404);
    return booking;
  }

  async cancelBooking(id, userId) {
    const booking = await this.getBookingById(id, userId);
    if (booking.status !== "confirmed") {
      throw new AppError(`Cannot cancel booking in '${booking.status}' status`, 400);
    }

    // Find slot ID to restore
    const parking = await bookingRepository.getParkingWithPricingAndSlots(booking.parkingId, booking.vehicleType);
    if (!parking || !parking.slots || parking.slots.length === 0) {
      throw new AppError("Parking slot configuration missing", 500);
    }

    const platformSettings = await bookingRepository.getPlatformSettings();
    const cancellationFeeRate = parseFloat(platformSettings.cancellationFeeRate);

    const slotId = parking.slots[0].id;
    const grossAmount = parseFloat(booking.grossAmount);

    const cancelled = await bookingRepository.cancelBookingTransaction(id, userId, grossAmount, cancellationFeeRate, slotId);

    return {
      success: true,
      data: cancelled,
      message: "Booking cancelled and refunded to wallet minus cancellation fee",
    };
  }
}

export const bookingService = new BookingService();
