import { addonsRepository } from "./addons.repository.js";
import { authRepository } from "../../common/auth/auth.repository.js";
import { AppError } from "../../utils/AppError.js";

export class AddonsService {
  async configureAddons(parkingId, ownerId, { addonsEnabled }) {
    const parking = await addonsRepository.findParkingByIdAndOwner(parkingId, ownerId);
    if (!parking) throw new AppError("Parking lot not found or unauthorized", 404);

    const updated = await addonsRepository.updateEnabledAddons(parkingId, addonsEnabled);
    return {
      success: true,
      data: updated.addonsEnabled,
      message: "Add-on services tags configured successfully",
    };
  }

  async createCustomAddon(parkingId, ownerId, data) {
    const user = await authRepository.findUserById(ownerId);
    if (!user || !user.ownerProfile || user.ownerProfile.verificationStatus !== "approved") {
      throw new AppError("Forbidden: Your business KYC profile is pending super admin approval. You cannot add custom add-ons yet.", 403);
    }

    const parking = await addonsRepository.findParkingByIdAndOwner(parkingId, ownerId);
    if (!parking) throw new AppError("Parking lot not found or unauthorized", 404);

    const addon = await addonsRepository.createCustomAddon(parkingId, data);
    return {
      success: true,
      data: addon,
      message: "Dynamic custom add-on service created successfully",
    };
  }

  async getCustomAddons(parkingId, ownerId) {
    const parking = await addonsRepository.findParkingByIdAndOwner(parkingId, ownerId);
    if (!parking) throw new AppError("Parking lot not found or unauthorized", 404);

    const addons = await addonsRepository.findCustomAddons(parkingId);
    return {
      success: true,
      data: addons,
      message: "Custom add-on services retrieved successfully",
    };
  }

  async updateCustomAddon(addonId, ownerId, data) {
    const existing = await addonsRepository.findCustomAddonByIdAndOwner(addonId, ownerId);
    if (!existing) throw new AppError("Custom add-on service not found or unauthorized", 404);

    const updated = await addonsRepository.updateCustomAddon(addonId, data);
    return {
      success: true,
      data: updated,
      message: "Custom add-on service updated successfully",
    };
  }

  async getAddonBookings(parkingId, ownerId) {
    const parking = await addonsRepository.findParkingByIdAndOwner(parkingId, ownerId);
    if (!parking) throw new AppError("Parking lot not found or unauthorized", 404);

    const bookings = await addonsRepository.findAddonBookingsByParking(parkingId);
    return {
      success: true,
      data: bookings,
      message: "Add-on service requests retrieved successfully",
    };
  }

  async updateAddonStatus(addonBookingId, ownerId, status) {
    const addonBooking = await addonsRepository.findAddonBookingById(addonBookingId);
    if (!addonBooking) throw new AppError("Add-on booking request not found", 404);

    const parking = await addonsRepository.findParkingByIdAndOwner(addonBooking.booking.parkingId, ownerId);
    if (!parking) throw new AppError("Unauthorized to manage this add-on request", 403);

    const updated = await addonsRepository.updateAddonStatus(addonBookingId, status);
    return {
      success: true,
      data: updated,
      message: `Add-on service status updated to '${status}'`,
    };
  }
}

export const addonsService = new AddonsService();
