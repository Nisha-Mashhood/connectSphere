import { createAdmin, findAdminByEmail, updatePassword, updateRefreshToken, findOrCreateAdmin, } from "../../repositories/Admin/admin.repositry.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, removeRefreshTokenForAdmin } from "../../utils/jwt.utils.js";
import { generateOTP } from "../../utils/otp.utils.js";
import { sendEmail } from "../../utils/email.utils.js";
// Handle Registration with details 
export const sigupDetails = async (data) => {
    const { name, email, password } = data;
    //console.log("data at service file :",data);
    // Check if the email already exists
    const AdminExists = await findAdminByEmail(email);
    if (AdminExists)
        throw new Error("Admin already exists.");
    //create new Admin with the passed details
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await createAdmin({ name, email, password: hashedPassword });
    return newAdmin;
};
// Handle login logic
export const loginAdmin = async (email, password) => {
    const Admin = await findAdminByEmail(email);
    if (!Admin)
        throw new Error("Admin not found");
    // Ensure Admin.password is defined
    if (!Admin.password) {
        throw new Error("Password not set for Admin");
    }
    // Check if password matches
    const isMatch = await bcrypt.compare(password, Admin.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    // Generate JWT token
    const accessToken = generateAccessToken({ AdminId: Admin._id });
    const refreshToken = generateRefreshToken({ AdminId: Admin._id });
    // Save the refresh token in the database
    await updateRefreshToken(Admin._id.toString(), refreshToken);
    return { Admin, accessToken, refreshToken };
};
// Handle refresh token logic
export const refreshToken = async (refreshToken) => {
    try {
        // Verify the refresh token
        const decoded = verifyRefreshToken(refreshToken);
        // Generate a new access token
        const newAccessToken = generateAccessToken({ AdminId: decoded.AdminId });
        return { newAccessToken };
    }
    catch (error) {
        throw new Error("Invalid or expired refresh token.");
    }
};
export const findOrCreateAdminforPassport = async (profile, provider) => {
    if (!profile)
        throw new Error('Profile not found');
    if (!provider)
        throw new Error('Provider not defined');
    let Admin = await findOrCreateAdmin(profile, provider);
    return Admin;
};
//Handle forgot password
const otpStore = {}; // Temporary storage for OTPs
export const forgotPassword = async (email) => {
    const Admin = await findAdminByEmail(email);
    if (!Admin)
        throw new Error("Admin not found.");
    const otp = generateOTP();
    otpStore[email] = otp; // Save OTP in memory
    await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);
    // Return the OTP for testing (remove in production)
    return otp;
};
//Handle veify OTP logic
export const verifyOTP = async (email, otp) => {
    if (otpStore[email] !== otp)
        throw new Error("Invalid or expired OTP.");
    delete otpStore[email]; // OTP is used once
    return generateAccessToken({ email }, "10m"); // Temporary token for resetting password
};
//Handle reset password
export const resetPassword = async (email, newPassword) => {
    const Admin = await findAdminByEmail(email);
    if (!Admin)
        throw new Error("Admin not found.");
    //Compare the old password with the new one
    const isSamePassword = await bcrypt.compare(newPassword, Admin.password || "");
    if (isSamePassword)
        throw new Error("New password cannot be the same as the old password.");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(Admin._id.toString(), hashedPassword);
};
//Handle logout
export const logout = async (Adminemail) => {
    ;
    try {
        // Call the removeRefreshToken function 
        await removeRefreshTokenForAdmin(Adminemail);
    }
    catch (error) {
        throw new Error('Error during logout: ' + error.message);
    }
};
//# sourceMappingURL=auth.service.js.map