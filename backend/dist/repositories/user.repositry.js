import User from "../models/user.model.js";
// Create a new user
export const createUser = async (userData) => {
    return await User.create(userData);
};
// Find a user by email
export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};
// Find a user by ID
export const findUserById = async (id) => {
    return await User.findById(id);
};
// Update a user
export const updateUser = async (id, updateData) => {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
};
//update password
export const updatePassword = async (id, password) => User.findByIdAndUpdate(id, { password }, { new: true });
// Update the refresh token for a user
export const updateRefreshToken = async (userId, refreshToken) => {
    return await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
};
// Remove refresh token (logout)
export const removeRefreshToken = async (userId) => {
    return await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
};
//# sourceMappingURL=user.repositry.js.map