import { Router } from "express";
import { registerHandler, loginHandler, getMeHandler } from "./auth.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", authenticateToken, getMeHandler);

export { authRouter };
