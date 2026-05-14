import { vehicleRepository } from "./vehicle.repository.js";
import { AppError } from "../../utils/AppError.js";

export class VehicleService {
  async getVehicles(userId) {
    return await vehicleRepository.findVehiclesByUserId(userId);
  }

  async addVehicle(userId, vehicleData) {
    return await vehicleRepository.createVehicle(userId, vehicleData);
  }

  async updateVehicle(id, userId, regNumber) {
    const vehicle = await vehicleRepository.findVehicleByIdAndUser(id, userId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);
    return await vehicleRepository.updateVehicle(id, regNumber);
  }

  async setActiveVehicle(id, userId) {
    const vehicle = await vehicleRepository.findVehicleByIdAndUser(id, userId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    await vehicleRepository.unsetActiveVehicles(userId);
    return await vehicleRepository.setActiveVehicle(id);
  }

  async deleteVehicle(id, userId) {
    const vehicle = await vehicleRepository.findVehicleByIdAndUser(id, userId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);
    await vehicleRepository.deleteVehicle(id);
    return { success: true, message: "Vehicle removed successfully" };
  }
}

export const vehicleService = new VehicleService();
