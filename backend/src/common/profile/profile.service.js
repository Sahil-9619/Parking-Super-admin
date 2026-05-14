import { profileRepository } from "./profile.repository.js";
import { AppError } from "../../utils/AppError.js";

export class ProfileService {
  async getProfile(userId) {
    const user = await profileRepository.findUserById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async updateProfile(userId, data) {
    return await profileRepository.updateUser(userId, data);
  }
}

export const profileService = new ProfileService();
