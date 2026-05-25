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

  async updateProfile(userId, { name, ownerType, gstNumber, globalTermsAccepted, verificationStatus }) {
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    const data = { ownerType, gstNumber };
    if (verificationStatus) data.verificationStatus = verificationStatus;
    
    if (globalTermsAccepted) {
      data.globalTermsAccepted = true;
      data.globalTermsAcceptedAt = new Date();
      data.globalTermsVersion = "1.0.0";
    }

    return await prisma.ownerProfile.update({
      where: { userId },
      data,
    });
  }

  async updateBankDetails(userId, { bankAccount, bankIfsc, accountHolderName, aadharNumber, aadharPic, verificationStatus }) {
    return await prisma.ownerProfile.update({
      where: { userId },
      data: { bankAccount, bankIfsc, accountHolderName, aadharNumber, aadharPic, verificationStatus },
    });
  }
}

export const kycRepository = new KycRepository();
