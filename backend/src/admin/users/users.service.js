import { usersRepository } from "./users.repository.js";

export class UsersService {
  async getUsers(query) {
    const filters = {};
    if (query.userType) filters.userType = query.userType;
    if (query.status) filters.status = query.status;

    return await usersRepository.findUsers(filters);
  }

  async updateUserStatus(id, status) {
    const updated = await usersRepository.updateUserStatus(id, status);
    return {
      success: true,
      data: updated,
      message: `User status updated to '${status}'`,
    };
  }

  async updateUser(id, data) {
    const updated = await usersRepository.updateUser(id, data);
    return {
      success: true,
      data: updated,
      message: "User profile updated successfully",
    };
  }

  async deleteUser(id) {
    await usersRepository.deleteUser(id);
    return {
      success: true,
      message: "User deleted successfully",
    };
  }
}


export const usersService = new UsersService();
