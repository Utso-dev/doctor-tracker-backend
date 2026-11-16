import { Request, Response } from "express";
import { getMeService, getAllUsersService } from "./user.services.js";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const user = await getMeService(userId);
    res.status(200).json({
      success: true,
      status: "success",
      data: user,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({
      success: true,
      status: "success",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
