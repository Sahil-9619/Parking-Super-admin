import { prisma } from "../../../config/prisma.js";

export class UsersRepository {
  async findUsers(filters) {
    return await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        walletBalance: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateUserStatus(id, status) {
    return await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true },
    });
  }
}

export const usersRepository = new UsersRepository();
