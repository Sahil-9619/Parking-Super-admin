import { prisma } from "../../../config/prisma.js";

export class AuthRepository {
  async findUserByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone },
      include: { ownerProfile: true },
    });
  }

  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: { ownerProfile: true },
    });
  }

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { ownerProfile: true },
    });
  }

  async findUserByEmailWithUsage(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        ownerProfile: true,
        _count: {
          select: {
            vehicles: true,
            parkings: true,
            bookings: true,
            walletTxns: true,
            payouts: true,
            raisedDisputes: true,
            reviews: true,
          },
        },
      },
    });
  }

  async findUserByPhoneWithUsage(phone) {
    return await prisma.user.findUnique({
      where: { phone },
      include: {
        ownerProfile: true,
        _count: {
          select: {
            vehicles: true,
            parkings: true,
            bookings: true,
            walletTxns: true,
            payouts: true,
            raisedDisputes: true,
            reviews: true,
          },
        },
      },
    });
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async createUser(userData) {
    return await prisma.user.create({ data: userData });
  }

  async updateUserStatus(id, status) {
    return await prisma.user.update({
      where: { id },
      data: { status },
      include: { ownerProfile: true },
    });
  }

  async createOwnerProfile(userId, ownerType) {
    return await prisma.ownerProfile.create({
      data: {
        userId,
        ownerType: ownerType || "commercial",
        verificationStatus: "pending",
      },
    });
  }

  async getUserProfile(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { ownerProfile: true },
    });
  }
}

export const authRepository = new AuthRepository();
