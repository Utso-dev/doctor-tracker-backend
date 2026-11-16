import { User } from "./auth.model.js";
import { hashPassword, comparePassword, generateToken } from "../../utils/auth.js";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "doctor" | "staff";
}) => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    role: data.role || "admin",
  });

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const user = await User.findOne({ email: data.email.toLowerCase() }).select("+password");
  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
