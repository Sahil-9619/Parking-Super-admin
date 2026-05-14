import { prisma } from "../../../config/prisma.js";

export class ProfileRepository {
  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        walletBalance: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateUser(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        walletBalance: true,
      },
    });
  }
}

export const profileRepository = new ProfileRepository();
