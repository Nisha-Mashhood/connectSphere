// src/repositories/user.repository.ts
import User from "../models/user.model.js";
// Fetch all users
export const getAllUsers = async () => {
    return await User.find();
};
// Fetch user by ID
export const getUserById = async (id) => {
    return await User.findById(id);
};
// Update user profile
export const updateUserProfile = async (id, data) => {
    return await User.findByIdAndUpdate(id, data, { new: true });
};
// Block a user
export const blockUser = async (id) => {
    await User.findByIdAndUpdate(id, { isBlocked: true });
};
// Unblock a user
export const unblockUser = async (id) => {
    await User.findByIdAndUpdate(id, { isBlocked: false });
};
//Update User Role
export const updateUserRole = async (userId, role) => {
    // Find the user by ID and update the role
    await User.findByIdAndUpdate(userId, { role }, { new: true });
};
//# sourceMappingURL=usermanagemnt.repositry.js.map