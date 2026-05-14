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
}

export const authRepository = new AuthRepository();
