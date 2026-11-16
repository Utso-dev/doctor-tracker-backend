import { Request, Response } from "express";
import { getDashboardStatsService } from "./dashboard.services.js";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard statistics",
    });
  }
};
