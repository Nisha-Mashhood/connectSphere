import User, { UserInterface } from "../models/user.model.js";

// Create a new user
export const createUser = async (userData: Partial<UserInterface>) => {
  return await User.create(userData);
};

// Find a user by email
export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// Find a user by ID
export const findUserById = async (id: string) => {
  return await User.findById(id);
};

// Update a user
export const updateUser = async (
  id: string,
  updateData: Partial<UserInterface>
) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

//update password
export const updatePassword = async (id: string, password: string) =>
  User.findByIdAndUpdate(id, { password }, { new: true });

// Update the refresh token for a user
export const updateRefreshToken = async (userId: string, refreshToken: string) => {
  return await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
};

// Remove refresh token (logout)
export const removeRefreshToken = async (userId: string) => {
  return await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
};