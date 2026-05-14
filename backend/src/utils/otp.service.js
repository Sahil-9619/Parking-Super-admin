import { AppError } from "./AppError.js";

class OtpService {
  constructor() {
    // In-memory store: Key -> identifier (phone or email), Value -> { otp, expiresAt }
    this.store = new Map();
  }

  generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Generates, stores, and dispatches OTP via SMS and/or Email channels
   */
  async sendOtp({ phone, email, purpose = "Verification" }) {
    const otp = this.generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

    if (phone) {
      this.store.set(phone, { otp, expiresAt });
      // Generic plug-in point for any SMS Gateway (Twilio, AWS SNS, MSG91, etc.)
      console.log(`\n================== [OTP SERVICE] ==================`);
      console.log(`[SMS CHANNEL] Sending ${purpose} OTP: [ ${otp} ] to Mobile: ${phone}`);
      console.log(`===================================================\n`);
    }

    if (email) {
      this.store.set(email, { otp, expiresAt });
      // Generic plug-in point for any Email Gateway (SendGrid, Nodemailer, AWS SES, etc.)
      console.log(`\n================== [OTP SERVICE] ==================`);
      console.log(`[EMAIL CHANNEL] Sending ${purpose} OTP: [ ${otp} ] to Email: ${email}`);
      console.log(`===================================================\n`);
    }

    return { success: true, message: `OTP dispatched successfully for ${purpose}` };
  }

  verifyOtp({ identifier, inputOtp }) {
    const record = this.store.get(identifier);

    if (!record) {
      throw new AppError("OTP expired or not requested for this identifier", 400);
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(identifier);
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    if (record.otp !== inputOtp) {
      throw new AppError("Invalid OTP entered", 400);
    }

    // OTP verified successfully, clear from store
    this.store.delete(identifier);
    return true;
  }
}

export const otpService = new OtpService();
