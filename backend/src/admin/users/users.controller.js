import { usersService } from "./users.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class UsersController {
  getUsers = catchAsync(async (req, res) => {
    const users = await usersService.getUsers(req.query);
    res.json({ success: true, data: users, message: "Users list retrieved successfully" });
  });

  updateUserStatus = catchAsync(async (req, res) => {
    const result = await usersService.updateUserStatus(req.params.id, req.body.status);
    res.json(result);
  });
}

export const usersController = new UsersController();
