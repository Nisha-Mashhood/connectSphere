// src/repositories/user.repository.ts
import User, { UserInterface } from "../models/user.model.js";

// Fetch all users
export const getAllUsers = async (): Promise<UserInterface[]> => {
  return await User.find();
};

// Fetch user by ID
export const getUserById = async (id: string): Promise<UserInterface | null> => {
  return await User.findById(id);
};

// Update user profile
export const updateUserProfile = async (
  id: string,
  data: Partial<UserInterface>
): Promise<UserInterface | null> => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

// Block a user
export const blockUser = async (id: string): Promise<void> => {
  await User.findByIdAndUpdate(id, { isBlocked: true });
};

// Unblock a user
export const unblockUser = async (id: string): Promise<void> => {
  await User.findByIdAndUpdate(id, { isBlocked: false });
};
