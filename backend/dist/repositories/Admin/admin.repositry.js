import Admin from "../../models/admin.model.js";
// Create a new user
export const createAdmin = async (adminData) => {
    return await Admin.create(adminData);
};
// Find a user by email
export const findAdminByEmail = async (email) => {
    return await Admin.findOne({ email });
};
// Find a user by ID
export const findAdminrById = async (id) => {
    return await Admin.findById(id);
};
// Find or create a user by OAuth profile
export const findOrCreateAdmin = async (profile, provider) => {
    if (!profile.email) {
        throw new Error("Email is required to find or create a user");
    }
    const email = profile.emails[0].value;
    let admin = await findAdminByEmail(email);
    if (!admin) {
        // If admin does not exist, create a new user
        admin = await Admin.create({
            fullName: profile.displayName,
            email,
            provider,
            providerId: profile.id,
            profilePic: profile.photos ? profile.photos[0].value : null,
            role: "user",
        });
    }
    return admin;
};
// Update a user
export const updateAdmin = async (id, updateData) => {
    return await Admin.findByIdAndUpdate(id, updateData, { new: true });
};
//update password
export const updatePassword = async (id, password) => Admin.findByIdAndUpdate(id, { password }, { new: true });
// Update the refresh token for a user
export const updateRefreshToken = async (adminId, refreshToken) => {
    return await Admin.findByIdAndUpdate(adminId, { refreshToken }, { new: true });
};
// Remove refresh token (logout)
export const removeRefreshToken = async (adminemail) => {
    await Admin.updateOne({ email: adminemail }, { $unset: { refreshToken: "" } });
    return;
};
//# sourceMappingURL=admin.repositry.js.map