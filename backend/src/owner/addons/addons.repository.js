import { prisma } from "../../../config/prisma.js";

export class AddonsRepository {
  async findParkingByIdAndOwner(parkingId, ownerId) {
    return await prisma.parking.findFirst({
      where: { id: parkingId, ownerId },
    });
  }

  async updateEnabledAddons(parkingId, addonsEnabled) {
    return await prisma.parking.update({
      where: { id: parkingId },
      data: { addonsEnabled },
    });
  }

  async createCustomAddon(parkingId, data) {
    return await prisma.customAddon.create({
      data: {
        parkingId,
        name: data.name,
        price: data.price,
        description: data.description,
        image: data.image,
      },
    });
  }

  async findCustomAddons(parkingId) {
    return await prisma.customAddon.findMany({
      where: { parkingId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findCustomAddonByIdAndOwner(addonId, ownerId) {
    return await prisma.customAddon.findFirst({
      where: {
        id: addonId,
        parking: { ownerId },
      },
    });
  }

  async updateCustomAddon(addonId, data) {
    return await prisma.customAddon.update({
      where: { id: addonId },
      data,
    });
  }

  async findAddonBookingsByParking(parkingId) {
    return await prisma.addonBooking.findMany({
      where: {
        booking: { parkingId },
      },
      include: {
        customAddon: true,
        booking: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAddonBookingById(id) {
    return await prisma.addonBooking.findUnique({
      where: { id },
      include: {
        booking: true,
      },
    });
  }

  async updateAddonStatus(id, status) {
    return await prisma.addonBooking.update({
      where: { id },
      data: { status },
    });
  }
}

export const addonsRepository = new AddonsRepository();
