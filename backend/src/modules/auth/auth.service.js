import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { AppError } from "../../utils/AppError.js";

export class AuthService {
  async authenticateAdmin({ email, password }) {
    const user = await authRepository.findAdminByEmail(email);
    if (!user) throw new AppError("Invalid email", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError("Invalid password", 401);

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }
}

export const authService = new AuthService();
