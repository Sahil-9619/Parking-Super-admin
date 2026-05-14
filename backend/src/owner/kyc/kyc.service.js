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
    return await kycRepository.updateProfile(userId, data);
  }

  async updateBankDetails(userId, { bankAccount, bankIfsc, accountHolderName }) {
    const profile = await kycRepository.findProfileByUserId(userId);
    if (!profile) throw new AppError("Owner profile not found", 404);

    const encryptedAccount = cryptoService.encrypt(bankAccount);
    const encryptedIfsc = cryptoService.encrypt(bankIfsc);

    await kycRepository.updateBankDetails(userId, {
      bankAccount: encryptedAccount,
      bankIfsc: encryptedIfsc,
      accountHolderName,
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
      },
      message: "Masked bank details retrieved successfully",
    };
  }
}

export const kycService = new KycService();
