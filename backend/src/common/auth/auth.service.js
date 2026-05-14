import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { otpService } from "../../utils/otp.service.js";
import { AppError } from "../../utils/AppError.js";

export class AuthService {
  generateTokens(user) {
    const payload = {
      id: user.id,
      userType: user.userType,
      email: user.email,
      phone: user.phone,
      adminRole: user.adminRole,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "30d",
    });

    return { accessToken, refreshToken };
  }

  async register({ name, email, password, phone, userType, adminRole }) {
    if (phone) {
      const existingPhone = await authRepository.findUserByPhone(phone);
      if (existingPhone) throw new AppError("Phone number already registered", 400);
    }

    if (email) {
      const existingEmail = await authRepository.findUserByEmail(email);
      if (existingEmail) throw new AppError("Email already registered", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await authRepository.createUser({
      name,
      email,
      phone,
      passwordHash,
      userType,
      adminRole: userType === "admin" ? adminRole || "ops_staff" : null,
      status: "suspended",
    });

    if (userType === "owner") {
      await authRepository.createOwnerProfile(user.id, "commercial");
    }

    await otpService.sendOtp({ phone, email, purpose: "Registration" });

    return {
      success: true,
      message: "OTP sent successfully to registered mobile number and/or email",
      phone,
      email,
    };
  }

  async verifyRegisterOtp({ phone, email, otp }) {
    const identifier = phone || email;
    otpService.verifyOtp({ identifier, inputOtp: otp });

    const user = phone
      ? await authRepository.findUserByPhone(phone)
      : await authRepository.findUserByEmail(email);

    if (!user) throw new AppError("User not found", 404);

    const activeUser = await authRepository.updateUserStatus(user.id, "active");
    const tokens = this.generateTokens(activeUser);

    return {
      success: true,
      data: {
        user: {
          id: activeUser.id,
          name: activeUser.name,
          email: activeUser.email,
          phone: activeUser.phone,
          userType: activeUser.userType,
          ownerProfile: activeUser.ownerProfile ? { verificationStatus: activeUser.ownerProfile.verificationStatus } : undefined,
        },
        ...tokens,
      },
      message: "Account verified and registered successfully. Business KYC verification pending super admin approval.",
    };
  }

  async sendLoginOtp({ phone, email }) {
    const identifier = phone || email;
    const user = phone
      ? await authRepository.findUserByPhone(phone)
      : await authRepository.findUserByEmail(email);

    if (!user) throw new AppError("Account not found with this identifier", 404);
    if (user.status === "banned") throw new AppError("Your account is banned", 403);

    await otpService.sendOtp({ phone, email, purpose: "Login" });

    return {
      success: true,
      message: "Login OTP sent successfully",
      identifier,
    };
  }

  async verifyLoginOtp({ phone, email, otp }) {
    const identifier = phone || email;
    otpService.verifyOtp({ identifier, inputOtp: otp });

    const user = phone
      ? await authRepository.findUserByPhone(phone)
      : await authRepository.findUserByEmail(email);

    if (!user) throw new AppError("User not found", 404);
    if (user.status !== "active") throw new AppError(`Account is ${user.status}`, 403);

    const tokens = this.generateTokens(user);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          ownerProfile: user.ownerProfile ? { verificationStatus: user.ownerProfile.verificationStatus } : undefined,
        },
        ...tokens,
      },
      message: "Logged in successfully",
    };
  }

  async loginPassword({ email, password }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);
    if (user.status !== "active") throw new AppError(`Account is ${user.status}`, 403);

    if (!user.passwordHash) throw new AppError("Password not set for this account. Use OTP login.", 401);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    const tokens = this.generateTokens(user);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          ownerProfile: user.ownerProfile ? { verificationStatus: user.ownerProfile.verificationStatus } : undefined,
        },
        ...tokens,
      },
      message: "Logged in successfully",
    };
  }
}

export const authService = new AuthService();
