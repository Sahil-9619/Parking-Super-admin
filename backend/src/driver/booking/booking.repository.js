import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma.js";

export class BookingRepository {
  async getParkingWithPricingAndSlots(parkingId, vehicleType) {
    return await prisma.parking.findUnique({
      where: { id: parkingId },
      include: {
        slots: {
          where: { vehicleType },
        },
        pricingRules: {
          where: { vehicleType },
        },
      },
    });
  }

  async getPlatformSettings() {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "platform_settings" },
    });
    if (!setting || !setting.value) {
      return {
        platformCommissionRate: 0.15,
        cancellationFeeRate: 0.05,
        overstayPenaltyRate: 1.5,
      };
    }
    return setting.value;
  }

  async createBookingTransaction(userId, parkingId, vehicleType, startTime, endTime, grossAmount, commission, ownerShare, qrToken, addonServices, commissionRate) {
    // Execute atomic transaction with FOR UPDATE row-level locking on parking slot
    return await prisma.$transaction(async (tx) => {
      // Find parking slot and lock the row to prevent concurrent double-booking.
      // Parameter binding — earlier revisions interpolated parkingId/vehicleType
      // directly, which was a SQL injection sink even behind auth.
      const slots = await tx.$queryRaw(Prisma.sql`
        SELECT id, available_slots AS "availableSlots"
        FROM parking_slots
        WHERE parking_id = ${parkingId}::uuid
          AND vehicle_type = ${vehicleType}::"VehicleType"
        FOR UPDATE
      `);

      if (!slots || slots.length === 0 || slots[0].availableSlots <= 0) {
        throw new Error("PARKING_FULL");
      }

      const slotId = slots[0].id;

      // Decrement available slots
      await tx.parkingSlot.update({
        where: { id: slotId },
        data: {
          availableSlots: { decrement: 1 },
        },
      });

      // Create main booking
      const booking = await tx.booking.create({
        data: {
          userId,
          parkingId,
          vehicleType,
          startTime,
          endTime,
          grossAmount,
          commission,
          ownerShare,
          totalCharged: grossAmount,
          status: "confirmed",
          qrToken,
          addonBookings: addonServices ? {
            create: addonServices.map(addon => ({
              customAddonId: addon.customAddonId,
              addonName: addon.addonName,
              serviceLevel: addon.serviceLevel,
              amount: addon.amount,
              commission: addon.amount * commissionRate,
              ownerShare: addon.amount * (1 - commissionRate),
              status: "pending",
            })),
          } : undefined,
        },
        include: {
          addonBookings: true,
          parking: {
            select: { name: true, address: true },
          },
        },
      });

      // Deduct from driver wallet balance & create wallet transaction
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { decrement: grossAmount },
        },
      });

      await tx.walletTxn.create({
        data: {
          userId,
          type: "debit",
          amount: grossAmount,
          referenceId: booking.id,
          referenceType: "booking",
          description: `Payment for parking booking at ${booking.parking.name}`,
          balanceAfter: updatedUser.walletBalance,
        },
      });

      return booking;
    });
  }

  async findDriverBookings(userId) {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        parking: {
          select: { name: true, address: true, photos: true },
        },
        addonBookings: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBookingByIdAndDriver(id, userId) {
    return await prisma.booking.findFirst({
      where: { id, userId },
      include: {
        parking: true,
        addonBookings: true,
      },
    });
  }

  async cancelBookingTransaction(bookingId, userId, grossAmount, cancellationFeeRate, slotId) {
    return await prisma.$transaction(async (tx) => {
      const cancellationFee = grossAmount * cancellationFeeRate;
      const refundAmount = grossAmount - cancellationFee;

      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
      });

      // Increment available slots
      await tx.parkingSlot.update({
        where: { id: slotId },
        data: { availableSlots: { increment: 1 } },
      });

      // Refund to user wallet minus cancellation fee
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: refundAmount } },
      });

      await tx.walletTxn.create({
        data: {
          userId,
          type: "refund",
          amount: refundAmount,
          referenceId: booking.id,
          referenceType: "cancellation_refund",
          description: `Refund for cancelled booking #${booking.id} (Deducted fee: ${cancellationFeeRate * 100}%)`,
          balanceAfter: updatedUser.walletBalance,
        },
      });

      return booking;
    });
  }
}

export const bookingRepository = new BookingRepository();
