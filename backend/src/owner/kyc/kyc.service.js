import { kycRepository } from "./kyc.repository.js";
import { cryptoService } from "../../utils/crypto.service.js";
import { AppError } from "../../utils/AppError.js";

export class KycService {
  async getProfile(userId) {
    const profile = await kycRepository.findProfileByUserId(userId);
    if (!profile) throw new AppError("Owner profile not found", 404);
    return profile;
  }

  async updateProfile(userId, data) {
    const profile = await kycRepository.findProfileByUserId(userId);
    if (!profile) throw new AppError("Owner profile not found", 404);
    // Reset verification status to pending when owner refills KYC details after rejection
    const updatedData = { ...data, verificationStatus: "pending" };
    return await kycRepository.updateProfile(userId, updatedData);
  }

  async updateBankDetails(userId, { bankAccount, bankIfsc, accountHolderName, aadharNumber, aadharPic }) {
    const profile = await kycRepository.findProfileByUserId(userId);
    if (!profile) throw new AppError("Owner profile not found", 404);

    const encryptedAccount = cryptoService.encrypt(bankAccount);
    const encryptedIfsc = cryptoService.encrypt(bankIfsc);

    // Reset verification status to pending on bank details update
    await kycRepository.updateBankDetails(userId, {
      bankAccount: encryptedAccount,
      bankIfsc: encryptedIfsc,
      accountHolderName,
      aadharNumber,
      aadharPic,
      verificationStatus: "pending",
    });

    return { success: true, message: "Bank details encrypted and stored successfully" };
  }

  async getBankDetails(userId) {
    const profile = await kycRepository.findProfileByUserId(userId);
    if (!profile || !profile.bankAccount) {
      throw new AppError("Bank details not configured yet", 404);
    }

    const decryptedAccount = cryptoService.decrypt(profile.bankAccount);
    const decryptedIfsc = cryptoService.decrypt(profile.bankIfsc);

    const last4 = decryptedAccount ? decryptedAccount.slice(-4) : "****";

    return {
      success: true,
      data: {
        accountLast4: last4,
        bankIfsc: decryptedIfsc,
        accountHolderName: profile.accountHolderName,
        aadharNumber: profile.aadharNumber,
        aadharPic: profile.aadharPic,
      },
      message: "Masked bank details retrieved successfully",
    };
  }
}

export const kycService = new KycService();
