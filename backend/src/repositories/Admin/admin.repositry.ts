import Admin, { AdminInterface } from "../../models/admin.model.js";

// Create a new user
export const createAdmin = async (adminData: Partial<AdminInterface>) => {
  return await Admin.create(adminData);
};

// Find a user by email
export const findAdminByEmail = async (email: string) => {
  return await Admin.findOne({ email });
};

// Find a user by ID
export const findAdminrById = async (id: string) => {
  return await Admin.findById(id);
};

// Find or create a user by OAuth profile
export const findOrCreateAdmin = async (profile: any, provider: string): Promise<AdminInterface> => {
  if (!profile.email) {
    throw new Error("Email is required to find or create a user");
  }
  const email = profile.emails[0].value;
  let admin= await findAdminByEmail(email);
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
export const updateAdmin= async (
  id: string,
  updateData: Partial<AdminInterface>
) => {
  return await Admin.findByIdAndUpdate(id, updateData, { new: true });
};

//update password
export const updatePassword = async (id: string, password: string) =>
  Admin.findByIdAndUpdate(id, { password }, { new: true });

// Update the refresh token for a user
export const updateRefreshToken = async (adminId: string, refreshToken: string) => {
  return await Admin.findByIdAndUpdate(adminId, { refreshToken }, { new: true });
};

// Remove refresh token (logout)
export const removeRefreshToken = async (adminemail: string) => {
    await Admin.updateOne({ email: adminemail }, { $unset: { refreshToken: "" } });
  return 
};
