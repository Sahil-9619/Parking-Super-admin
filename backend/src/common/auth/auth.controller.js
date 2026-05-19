import { authService } from "./auth.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class AuthController {
  register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  });

  verifyRegisterOtp = catchAsync(async (req, res) => {
    const result = await authService.verifyRegisterOtp(req.body);
    res.json(result);
  });

  sendLoginOtp = catchAsync(async (req, res) => {
    const result = await authService.sendLoginOtp(req.body);
    res.json(result);
  });

  verifyLoginOtp = catchAsync(async (req, res) => {
    const result = await authService.verifyLoginOtp(req.body);
    res.json(result);
  });

  loginPassword = catchAsync(async (req, res) => {
    const result = await authService.loginPassword(req.body);
    res.json(result);
  });

  logout = catchAsync(async (req, res) => {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });

  getProfile = catchAsync(async (req, res) => {
    res.json({
      success: true,
      data: {
        user: await authService.getUserProfile(req.user.id),
      },
      message: "Profile retrieved successfully",
    });
  });
}

export const authController = new AuthController();
