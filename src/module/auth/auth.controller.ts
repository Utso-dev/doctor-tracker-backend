import { Request, Response } from "express";
import { registerUser, loginUser, getUserProfile } from "./auth.services.js";

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password, role } = req.body;
    const displayName = name || username;

    if (!displayName || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
      return;
    }

    const result = await registerUser({
      name: displayName,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      status: "success",
      message: "Logged in successfully",
      data: result,
      token: result.token,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const getMeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await getUserProfile(userId);
    res.status(200).json({
      success: true,
      status: "success",
      data: user,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
};
