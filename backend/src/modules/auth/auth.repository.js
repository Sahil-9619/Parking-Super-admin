import { prisma } from "../../../config/prisma.js";

export class AuthRepository {
  async findAdminByEmail(email) {
    return await prisma.admin.findUnique({
      where: { email },
    });
  }
}

export const authRepository = new AuthRepository();
