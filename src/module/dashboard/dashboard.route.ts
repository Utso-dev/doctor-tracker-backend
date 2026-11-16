import { Router } from "express";
import { getDashboardStats } from "./dashboard.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const dashboardRouter = Router();

// Protect dashboard stats
dashboardRouter.get("/stats", authenticateToken, getDashboardStats);

export { dashboardRouter };
