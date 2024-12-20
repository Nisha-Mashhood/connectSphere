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
// Find or create a user by OAuth profile
export const findOrCreateUser = async (profile, provider) => {
    if (!profile.email) {
        throw new Error("Email is required to find or create a user");
    }
    const email = profile.emails[0].value;
    let user = await findUserByEmail(email);
    if (!user) {
        // If user does not exist, create a new user
        user = await User.create({
            fullName: profile.displayName,
            email,
            provider,
            providerId: profile.id,
            profilePic: profile.photos ? profile.photos[0].value : null,
            role: "user",
        });
    }
    return user;
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
export const removeRefreshToken = async (useremail) => {
    // Perform the query
    await User.updateOne({ email: useremail }, { $unset: { refreshToken: "" } });
    return;
};
//# sourceMappingURL=user.repositry.js.map