import { prisma } from "../../../config/prisma.js";

export class ParkingsRepository {
  async findAllParkings(page = 1, limit = 10, search = '', status = '', parkingType = '') {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (status && status !== 'All') {
      where.status = status.toLowerCase();
    }
    if (parkingType && parkingType !== 'All') {
      where.parkingType = parkingType;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.parking.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          slots: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit, 10)
      }),
      prisma.parking.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateParkingStatus(parkingId, status) {
    return await prisma.parking.update({
      where: { id: parkingId },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  async findParkingById(parkingId) {
    return await prisma.parking.findUnique({
      where: { id: parkingId },
    });
  }
  async updateParking(parkingId, data) {
    return await prisma.parking.update({
      where: { id: parkingId },
      data,
    });
  }

  async deleteParking(parkingId) {
    // Perform transaction to ensure related slots are deleted
    return await prisma.$transaction([
      prisma.parkingSlot.deleteMany({ where: { parkingId } }),
      prisma.parking.delete({ where: { id: parkingId } })
    ]);
  }
}

export const parkingsRepository = new ParkingsRepository();
