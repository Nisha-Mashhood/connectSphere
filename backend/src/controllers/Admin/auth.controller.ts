import { Request, Response } from "express";
import {
  loginAdmin,
  forgotPassword,
  verifyOTP,
  resetPassword,
  refreshToken as refeshTokenService,
  logout as logoutAdminService,
  sigupDetails,
} from "../../services/Admin/auth.service.js";
import { clearCookies, setTokensInCookies } from "../../utils/jwt.utils.js";
// import mongoose from "mongoose";

//Handles the personal details Registration
export const signup = async (req: Request, res: Response) => {
  try {
    
    await sigupDetails(req.body)
    res.status(201).json({
      message:"Adminr Registered Successfully"
    })
  } catch (error: any) {
    console.error("Signup Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};


// Handle Admin login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { Admin, accessToken, refreshToken } = await loginAdmin(
      email,
      password
    );
    // Store tokens in cookies
    setTokensInCookies(res, accessToken, refreshToken);
    res.json({ message: "Login successful", Admin });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Handle refresh token logic
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body; //refresh token is passed in the request body
    const { newAccessToken } = await refeshTokenService(refreshToken);
    res.json({ message: "Access token refreshed.", newAccessToken });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Google Auth Redirect
export const googleAuthRedirect = (req: Request, res: Response) => {
  const user: any = req.user;
  setTokensInCookies(res, user.accessToken, user.refreshToken);
  res.json({
    message: "Google login successful",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
};

// GitHub Auth Redirect
export const githubAuthRedirect = (req: Request, res: Response) => {
  const user: any = req.user;
  setTokensInCookies(res, user.accessToken, user.refreshToken);

  res.json({
    message: "GitHub login successful",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
};

// Handle logout
export const logout = async (req: Request, res: Response) => {
  try {
    const { adminemail } = req.body; 
    console.log("Email of Admin",adminemail);
    if (!adminemail) {
       res.status(400).json({ message: "Admin email is required." });
       return
    }
    // Call the logout service to remove the refresh token
    await logoutAdminService(adminemail);
    // Clear cookies
    clearCookies(res);

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

//Handle forgot password
export const handleForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const otp = await forgotPassword(email);
    res.status(200).json({ message: "OTP sent to email.", otp });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

//Handles verify OTP
export const handleVerifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const token = await verifyOTP(email, otp);
    res.status(200).json({ message: "OTP verified.", token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

//Handles Reset Password
export const handleResetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    await resetPassword(email, newPassword);
    res.status(200).json({ message: "Password reset successfully." });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

