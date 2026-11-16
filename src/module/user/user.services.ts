import { User } from "../auth/auth.model.js";

export const getMeService = async (userId: string) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getAllUsersService = async () => {
  return User.find().select("-password").lean();
};
