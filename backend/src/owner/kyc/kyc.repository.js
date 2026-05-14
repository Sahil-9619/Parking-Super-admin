import { prisma } from "../../../config/prisma.js";

export class KycRepository {
  async findProfileByUserId(userId) {
    return await prisma.ownerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });
  }

  async updateProfile(userId, { name, ownerType, gstNumber }) {
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    return await prisma.ownerProfile.update({
      where: { userId },
      data: { ownerType, gstNumber },
    });
  }

  async updateBankDetails(userId, { bankAccount, bankIfsc, accountHolderName }) {
    return await prisma.ownerProfile.update({
      where: { userId },
      data: { bankAccount, bankIfsc, accountHolderName },
    });
  }
}

export const kycRepository = new KycRepository();
