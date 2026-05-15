import { prisma } from "../../../config/prisma.js";

export class OwnersRepository {
  async findAllOwners() {
    return await prisma.user.findMany({
      where: { userType: "owner" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        walletBalance: true,
        status: true,
        createdAt: true,

        ownerProfile: {
          select: {
            ownerType: true,
            gstNumber: true,
            verificationStatus: true,
            strikeCount: true,
          },
        },
        parkings: {
          select: {
            id: true,
            ownerId: true,
            name: true,
            parkingType: true,
            address: true,
            latitude: true,
            longitude: true,
            photos: true,
            openTime: true,
            closeTime: true,
            is24hr: true,
            status: true,
            avgRating: true,
            addonsEnabled: true,
            isFull: true,
            isClosed: true,
            reopenAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },

        _count: {
          select: { parkings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOwnerFullDetails(ownerId) {
    return await prisma.user.findUnique({
      where: { id: ownerId },
      include: {
        ownerProfile: true,
        parkings: {
          include: {
            slots: true,
            pricingRules: true,
            customAddons: true,
            bookings: {
              select: {
                id: true,
                status: true,
                grossAmount: true,
                commission: true,
                ownerShare: true,
                vehicleType: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                user: { select: { name: true, phone: true } },
              },
              orderBy: { createdAt: "desc" },
              take: 50,
            },
            _count: {
              select: { bookings: true },
            },
          },
        },
        walletTxns: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async findOwnerProfiles(status) {
    const where = status ? { verificationStatus: status } : {};
    return await prisma.ownerProfile.findMany({
      where,
      include: {
        user: {
          select: { name: true, phone: true, email: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOwnerProfileById(ownerId) {
    return await prisma.ownerProfile.findUnique({
      where: { userId: ownerId },
      include: { user: true },
    });
  }

  async updateOwnerKycStatus(ownerId, status) {
    return await prisma.ownerProfile.update({
      where: { userId: ownerId },
      data: { verificationStatus: status },
      include: {
        user: { select: { name: true, phone: true, email: true } },
      },
    });
  }

  async disableOwnerAndParkings(ownerId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: ownerId },
        data: { status: "suspended" },
      });

      await tx.parking.updateMany({
        where: { ownerId },
        data: { status: "paused" },
      });

      return user;
    });
  }

  async enableOwnerAndParkings(ownerId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: ownerId },
        data: { status: "active" },
      });

      await tx.parking.updateMany({
        where: { ownerId, status: "paused" },
        data: { status: "pending" },
      });

      return user;
    });
  }

  async directOnboardOwnerTransaction(userData, ownerType, gstNumber) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          passwordHash: userData.passwordHash,
          userType: "owner",
          status: "active",
        },
      });

      const profile = await tx.ownerProfile.create({
        data: {
          userId: user.id,
          ownerType,
          gstNumber,
          verificationStatus: "approved",
        },
      });

      return { user, profile };
    });
  }

  async deleteOwner(ownerId) {
    return await prisma.user.delete({
      where: { id: ownerId },
    });
  }

  async updateOwner(ownerId, data) {
    const { 
      name, email, phone, status, 
      company, gstNumber, verificationStatus, strikeCount,
      walletBalance, bankDetails 
    } = data;

    return await prisma.user.update({
      where: { id: ownerId },
      data: {
        name,
        email,
        phone,
        status,
        walletBalance: walletBalance ? parseFloat(walletBalance) : undefined,
        ownerProfile: {
          update: {
            ownerType: company,
            gstNumber,
            verificationStatus,
            strikeCount: strikeCount ? parseInt(strikeCount) : undefined,
            accountHolderName: bankDetails?.holder,
            bankAccount: bankDetails?.account,
            bankIfsc: bankDetails?.ifsc,
          },
        },
      },
    });
  }


  async findUsers(filters) {

    return await prisma.user.findMany({
      where: filters,
      select: { id: true, name: true, email: true, phone: true, userType: true, createdAt: true, status: true },
    });
  }

  async getDashboardStats() {
    const [totalOwners, totalDrivers, recentOwners, recentDrivers] = await Promise.all([
      prisma.user.count({ where: { userType: "owner" } }),
      prisma.user.count({ where: { userType: "driver" } }),
      prisma.user.findMany({
        where: { userType: "owner" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          _count: { select: { parkings: true } }
        }

      }),
      prisma.user.findMany({
        where: { userType: "driver" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    return {
      totalOwners,
      totalDrivers,
      recentOwners,
      recentDrivers
    };
  }
}


export const ownersRepository = new OwnersRepository();
