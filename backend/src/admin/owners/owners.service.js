import { ownersRepository } from "./owners.repository.js";
import { AppError } from "../../utils/AppError.js";

export class OwnersService {
  async getAllOwners() {
    const owners = await ownersRepository.findAllOwners();
    return {
      success: true,
      data: owners,
      count: owners.length,
      message: "All owners retrieved successfully",
    };
  }

  async getOwnerDetails(ownerId) {
    const owner = await ownersRepository.findOwnerFullDetails(ownerId);
    if (!owner) throw new AppError("Owner not found", 404);
    if (owner.userType !== "owner") throw new AppError("This user is not an owner", 400);

    return {
      success: true,
      data: owner,
      message: "Owner full details retrieved successfully",
    };
  }

  async disableOwner(ownerId) {
    const owner = await ownersRepository.findOwnerFullDetails(ownerId);
    if (!owner) throw new AppError("Owner not found", 404);
    if (owner.userType !== "owner") throw new AppError("This user is not an owner", 400);

    const disabled = await ownersRepository.disableOwnerAndParkings(ownerId);
    return {
      success: true,
      data: { id: disabled.id, name: disabled.name, status: disabled.status },
      message: "Owner account suspended and all their parking lots paused",
    };
  }

  async enableOwner(ownerId) {
    const owner = await ownersRepository.findOwnerFullDetails(ownerId);
    if (!owner) throw new AppError("Owner not found", 404);
    if (owner.userType !== "owner") throw new AppError("This user is not an owner", 400);

    const enabled = await ownersRepository.enableOwnerAndParkings(ownerId);
    return {
      success: true,
      data: { id: enabled.id, name: enabled.name, status: enabled.status },
      message: "Owner account re-activated and parking lots set to pending review",
    };
  }

  async getOwnerKycList(query) {
    const profiles = await ownersRepository.findOwnerProfiles(query.status);
    return {
      success: true,
      data: profiles,
      message: "Owner KYC profiles retrieved successfully",
    };
  }

  async approveOwnerKyc(ownerId, status) {
    const profile = await ownersRepository.findOwnerProfileById(ownerId);
    if (!profile) throw new AppError("Owner profile not found", 404);

    const updated = await ownersRepository.updateOwnerKycStatus(ownerId, status);
    return {
      success: true,
      data: updated,
      message: `Owner business KYC profile marked as '${status}'`,
    };
  }

  async adminOnboardOwner({ name, phone, email, password, ownerType, gstNumber }) {
    const existingPhone = await ownersRepository.findUsers({ phone });
    if (existingPhone.length > 0) throw new AppError("Phone number already registered", 400);

    const existingEmail = await ownersRepository.findUsers({ email });
    if (existingEmail.length > 0) throw new AppError("Email already registered", 400);

    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await ownersRepository.directOnboardOwnerTransaction(
      { name, phone, email, passwordHash },
      ownerType,
      gstNumber
    );

    return {
      success: true,
      data: {
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        ownerType: result.profile.ownerType,
        verificationStatus: result.profile.verificationStatus,
      },
      message: "Owner business onboarded and pre-approved successfully by Super Admin",
    };
  }

  async updateOwner(ownerId, data) {
    const updated = await ownersRepository.updateOwner(ownerId, data);
    return {
      success: true,
      data: updated,
      message: "Owner profile updated successfully",
    };
  }

  async deleteOwner(ownerId) {
    await ownersRepository.deleteOwner(ownerId);
    return {
      success: true,
      message: "Owner account deleted successfully",
    };
  }
}


export const ownersService = new OwnersService();
