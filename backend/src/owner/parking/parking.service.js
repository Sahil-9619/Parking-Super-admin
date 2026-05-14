import { parkingRepository } from "./parking.repository.js";
import { authRepository } from "../../common/auth/auth.repository.js";
import { AppError } from "../../utils/AppError.js";

export class ParkingService {
  async createParking(ownerId, data) {
    const user = await authRepository.findUserById(ownerId);
    if (!user || !user.ownerProfile || user.ownerProfile.verificationStatus !== "approved") {
      throw new AppError("Forbidden: Your business KYC profile is pending super admin approval. You cannot add parking areas yet.", 403);
    }
    return await parkingRepository.createParking(ownerId, data);
  }

  async getParkings(ownerId) {
    return await parkingRepository.findParkingsByOwner(ownerId);
  }

  async getParkingById(id, ownerId) {
    const parking = await parkingRepository.findParkingByIdAndOwner(id, ownerId);
    if (!parking) throw new AppError("Parking lot not found", 404);
    return parking;
  }

  async updateParking(id, ownerId, data) {
    await this.getParkingById(id, ownerId);
    return await parkingRepository.updateParking(id, data);
  }

  async updateStatus(id, ownerId, status) {
    await this.getParkingById(id, ownerId);
    return await parkingRepository.updateParkingStatus(id, status);
  }

  async deleteParking(id, ownerId) {
    await this.getParkingById(id, ownerId);
    await parkingRepository.deleteParking(id);
    return { success: true, message: "Parking lot deleted successfully" };
  }

  async configureSlots(parkingId, ownerId, { vehicleType, totalSlots }) {
    await this.getParkingById(parkingId, ownerId);
    const slot = await parkingRepository.upsertSlot(parkingId, vehicleType, totalSlots);
    return { success: true, data: slot, message: "Capacity slots configured successfully" };
  }

  async configurePricing(parkingId, ownerId, { vehicleType, weekdayPrice, weekendPrice, peakRules }) {
    await this.getParkingById(parkingId, ownerId);
    const pricing = await parkingRepository.upsertPricing(parkingId, vehicleType, weekdayPrice, weekendPrice, peakRules);
    return { success: true, data: pricing, message: "Pricing rules configured successfully" };
  }
}

export const parkingService = new ParkingService();
