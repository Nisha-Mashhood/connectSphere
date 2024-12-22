import {
  createAdmin,
  findAdminByEmail,
  updatePassword,
  updateRefreshToken,
  findOrCreateAdmin,
} from "../../repositories/Admin/admin.repositry.js";
import bcrypt from "bcryptjs";
import { generateAccessToken,generateRefreshToken, verifyRefreshToken, removeRefreshTokenForAdmin } from "../../utils/jwt.utils.js";
import { generateOTP } from "../../utils/otp.utils.js";
import { sendEmail } from "../../utils/email.utils.js";

// Handle Registration with details 
export const sigupDetails = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = data;
  //console.log("data at service file :",data);
  // Check if the email already exists
  const AdminExists = await findAdminByEmail(email);
  if (AdminExists) throw new Error("Admin already exists.");

  //create new Admin with the passed details
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await createAdmin({  name, email, password:hashedPassword });
  return newAdmin;
};


// Handle login logic
export const loginAdmin = async (email: string, password: string) => {
  const Admin = await findAdminByEmail(email);
  if (!Admin) throw new Error("Admin not found");


  // Ensure Admin.password is defined
  if (!Admin.password) {
    throw new Error("Password not set for Admin");
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, Admin.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate JWT token
  const accessToken = generateAccessToken({ AdminId: Admin._id });
  const refreshToken = generateRefreshToken({ AdminId: Admin._id });

  // Save the refresh token in the database
  await updateRefreshToken(Admin._id.toString(), refreshToken);
  return { Admin, accessToken, refreshToken };
};


// Handle refresh token logic
export const refreshToken = async (refreshToken: string) => {
  try {
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate a new access token
    const newAccessToken = generateAccessToken({ AdminId: decoded.AdminId });

    return { newAccessToken };
  } catch (error) {
    throw new Error("Invalid or expired refresh token.");
  }
};


export const findOrCreateAdminforPassport = async (profile: any, provider: string) =>{
  if(!profile) throw new Error('Profile not found');
  if(!provider) throw new Error('Provider not defined');

  let Admin = await findOrCreateAdmin(profile, provider);

  return Admin;
}

//Handle forgot password
const otpStore: Record<string, string> = {}; // Temporary storage for OTPs

export const forgotPassword = async (email: string) => {
  const Admin = await findAdminByEmail(email);
  if (!Admin) throw new Error("Admin not found.");

  const otp = generateOTP();
  otpStore[email] = otp; // Save OTP in memory
  await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);
  
  // Return the OTP for testing (remove in production)
  return otp;
};

//Handle veify OTP logic
export const verifyOTP = async (email: string, otp: string) => {
  if (otpStore[email] !== otp) throw new Error("Invalid or expired OTP.");
  delete otpStore[email]; // OTP is used once
  return generateAccessToken({ email }, "10m"); // Temporary token for resetting password
};

//Handle reset password
export const resetPassword = async (email: string, newPassword: string) => {
  const Admin = await findAdminByEmail(email);
  if (!Admin) throw new Error("Admin not found.");

  //Compare the old password with the new one
  const isSamePassword = await bcrypt.compare(newPassword, Admin.password || "");
  if (isSamePassword)
    throw new Error("New password cannot be the same as the old password.");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updatePassword(Admin._id.toString(), hashedPassword);
};

//Handle logout
export const logout = async(Adminemail:string) =>{;
  try {
    // Call the removeRefreshToken function 
    await removeRefreshTokenForAdmin(Adminemail);
  } catch (error: any) {
    throw new Error('Error during logout: ' + error.message);
  }
}
