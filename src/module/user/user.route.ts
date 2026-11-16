import { Router } from "express";
import { getMe, getAllUsers } from "./user.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/me", authenticateToken, getMe);
userRouter.get("/", authenticateToken, getAllUsers);

export { userRouter };
