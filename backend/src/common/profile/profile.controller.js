import { profileService } from "./profile.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class ProfileController {
  getProfile = catchAsync(async (req, res) => {
    const profile = await profileService.getProfile(req.user.id);
    res.json({ success: true, data: profile, message: "Profile retrieved successfully" });
  });

  updateProfile = catchAsync(async (req, res) => {
    const updated = await profileService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: updated, message: "Profile updated successfully" });
  });
}

export const profileController = new ProfileController();
