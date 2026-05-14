import { prisma } from "../../../config/prisma.js";

export class VehicleRepository {
  async findVehiclesByUserId(userId) {
    return await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findVehicleByIdAndUser(id, userId) {
    return await prisma.vehicle.findFirst({
      where: { id, userId },
    });
  }

  async createVehicle(userId, { regNumber, vehicleType }) {
    return await prisma.vehicle.create({
      data: {
        userId,
        regNumber,
        vehicleType,
      },
    });
  }

  async updateVehicle(id, regNumber) {
    return await prisma.vehicle.update({
      where: { id },
      data: { regNumber },
    });
  }

  async unsetActiveVehicles(userId) {
    return await prisma.vehicle.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async setActiveVehicle(id) {
    return await prisma.vehicle.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deleteVehicle(id) {
    return await prisma.vehicle.delete({
      where: { id },
    });
  }
}

export const vehicleRepository = new VehicleRepository();
