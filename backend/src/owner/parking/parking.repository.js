import { prisma } from "../../../config/prisma.js";

export class ParkingRepository {
  async createParking(ownerId, data, clientIp) {
    const parking = await prisma.parking.create({
      data: {
        ownerId,
        name: data.name,
        parkingType: data.parkingType,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        openTime: data.openTime,
        closeTime: data.closeTime,
        is24hr: data.is24hr,
        addonsEnabled: data.addonsEnabled || [],
        status: "pending",
        ownershipType: data.ownershipType,
        propertyPaper: data.propertyPaper || null,
        leaseAgreement: data.leaseAgreement || null,
        parkingAreaPics: data.parkingAreaPics || [],
        kycStatus: "pending",
        legalDeclarationAccepted: true,
        legalDeclarationAcceptedAt: new Date(),
        legalDeclarationIpAddress: clientIp || null,
      },
    });

    // Execute raw PostGIS query to set geography Point
    await prisma.$executeRawUnsafe(`
      UPDATE parkings 
      SET location = ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326) 
      WHERE id = '${parking.id}';
    `);

    return parking;
  }

  async findParkingsByOwner(ownerId) {
    return await prisma.parking.findMany({
      where: { ownerId },
      include: {
        parkingSlots: true,
        pricingRules: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findParkingByIdAndOwner(id, ownerId) {
    return await prisma.parking.findFirst({
      where: { id, ownerId },
      include: {
        parkingSlots: true,
        pricingRules: true,
      },
    });
  }

  async updateParking(id, data) {
    const updated = await prisma.parking.update({
      where: { id },
      data: {
        name: data.name,
        parkingType: data.parkingType,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        openTime: data.openTime,
        closeTime: data.closeTime,
        is24hr: data.is24hr,
        addonsEnabled: data.addonsEnabled,
        ownershipType: data.ownershipType,
        propertyPaper: data.ownershipType === "owned" ? data.propertyPaper : null,
        leaseAgreement: data.ownershipType === "rental" ? data.leaseAgreement : null,
        parkingAreaPics: data.parkingAreaPics,
        kycStatus: "pending", // Reset to pending if they update it
      },
    });

    if (data.latitude !== undefined && data.longitude !== undefined) {
      await prisma.$executeRawUnsafe(`
        UPDATE parkings 
        SET location = ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326) 
        WHERE id = '${id}';
      `);
    }

    return updated;
  }

  async updateParkingStatus(id, status) {
    return await prisma.parking.update({
      where: { id },
      data: { status },
    });
  }

  async deleteParking(id) {
    return await prisma.parking.delete({
      where: { id },
    });
  }

  async upsertSlot(parkingId, vehicleType, totalSlots) {
    // Find existing slot
    const existing = await prisma.parkingSlot.findUnique({
      where: {
        parkingId_vehicleType: { parkingId, vehicleType },
      },
    });

    if (existing) {
      const diff = totalSlots - existing.totalSlots;
      return await prisma.parkingSlot.update({
        where: { id: existing.id },
        data: {
          totalSlots,
          availableSlots: Math.max(0, existing.availableSlots + diff),
        },
      });
    }

    return await prisma.parkingSlot.create({
      data: {
        parkingId,
        vehicleType,
        totalSlots,
        availableSlots: totalSlots,
      },
    });
  }

  async upsertPricing(parkingId, vehicleType, weekdayPrice, weekendPrice, peakRules) {
    const existing = await prisma.pricingRule.findUnique({
      where: {
        parkingId_vehicleType: { parkingId, vehicleType },
      },
    });

    if (existing) {
      return await prisma.pricingRule.update({
        where: { id: existing.id },
        data: { weekdayPrice, weekendPrice, peakRules },
      });
    }

    return await prisma.pricingRule.create({
      data: {
        parkingId,
        vehicleType,
        weekdayPrice,
        weekendPrice,
        peakRules,
      },
    });
  }
}

export const parkingRepository = new ParkingRepository();
