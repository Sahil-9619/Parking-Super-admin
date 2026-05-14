import { authService } from "./auth.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class AuthController {
  loginAdmin = catchAsync(async (req, res) => {
    const result = await authService.authenticateAdmin(req.body);
    res.json(result);
  });

  getProfile = catchAsync(async (req, res) => {
    res.json({
      message: "Protected route accessed",
      user: req.user,
    });
  });
}

export const authController = new AuthController();
