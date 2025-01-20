import { Request, Response } from "express";
import {
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  refreshToken as refeshTokenService,
  logout as logoutUserService,
  sigupDetails,
  verifyAdminPasskey,
  checkProfileCompletion,
  profileDetails,
  updateUserProfile,
  googleSignupService,
  googleLoginService,
  githubLoginService,
  githubSignupService
} from "../services/auth.service.js";
import { clearCookies, setTokensInCookies } from "../utils/jwt.utils.js";

//Handles the Registration
export const signup = async (req: Request, res: Response) => {
  try {
    
    await sigupDetails(req.body)
    res.status(201).json({
      message:"User Registered Successfully"
    })
  } catch (error: any) {
    console.error("Signup Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};


// Handle user login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    //console.log(req.body);
    const { user, accessToken, refreshToken } = await loginUser(
      email,
      password
    );
    // Store tokens in cookies
    setTokensInCookies(res, accessToken, refreshToken);
    res.json({ message: "Login successful", user });
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
      return 
    }
    if (error.message === "Blocked") {
      res.status(403).json({ message: error.message });
      return 
    }
    if (error.message === "Invalid credentials") {
      res.status(401).json({ message: error.message });
      return 
    }
    if (error.message === "This account is registered using a third-party provider. Please log in with your provider.") {
      res.status(404).json({ message: error.message });
      return 
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
  }

// Google Signup Controller
export const googleSignup = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    const newUser = await googleSignupService(code);
    res.status(201).json({ message: "User signed up successfully", user: newUser });
  } catch (error: any) {
    console.error("Google Signup Error:", error.message);
    res.status(500).json({ message: "Google signup failed.", error: error.message });
  }
};

// Google Login Controller
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    const { user, accessToken, refreshToken } = await googleLoginService(code);

    // Store tokens in cookies
    setTokensInCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Google login successful",
      user,
      accessToken,
      refreshToken,
    });

  } catch (error: any) {
    if (error.message === "Email not registered") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Google login failed.", error: error.message });
    }
    return
  }
};

//Handles github Signup
export const githubSignup = async (req: Request, res: Response) =>{
  try {
    const { code } = req.body;
    console.log("Code received for signup:", code);

    const newUser = await githubSignupService(code);
    res.status(201).json({ message: "User signed up successfully", user: newUser });

  } catch (error:any) {
    console.error("Github Signup Error:", error.message);
    res.status(500).json({ message: "Github signup failed.", error: error.message });
    return
  }
}

//Handles github login
export const githubLogin = async (req: Request, res: Response) =>{
  try {
    const { code } = req.body;
    const { user, accessToken, refreshToken } = await githubLoginService(code);

    // Store tokens in cookies
    setTokensInCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Github login successful",
      user,
      accessToken,
      refreshToken,
    });

  } catch (error:any) {
    if (error.message === "Email not registered") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Github login failed.", error: error.message });
    }
    return
  }
}

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

export const checkProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const isComplete = await checkProfileCompletion(userId);
    res.status(200).json({ isProfileComplete: isComplete });
  } catch (error:any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getprofileDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const userDetails = await profileDetails(userId);
    res.status(200).json({
      message: "Profile details accessed successfully",
      userDetails,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.Id;
    const { name, email, phone, dateOfBirth, jobTitle, industry, reasonForJoining } = req.body;

    // Uploaded files (from multer)
    const profilePicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.["profilePic"]?.[0];
    const coverPicFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.["coverPic"]?.[0];

    const updatedUser = await updateUserProfile(id, {
      name,
      email,
      phone,
      dateOfBirth,
      jobTitle,
      industry,
      reasonForJoining,
      profilePicFile,
      coverPicFile,
    });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


// Handle logout
export const logout = async (req: Request, res: Response) => {
  try {
    const { email } = req.body; // Get email from the request body
    if (!email) {
       res.status(400).json({ message: "email is required." });
       return
    }
    // Call the logout service to remove the refresh token
    await logoutUserService(email);
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


export const verifyPasskey = async(req:Request, res:Response) => {
  try {
    const { passkey } = req.body;
    const isValid = verifyAdminPasskey(passkey);
    res.status(200).json({ valid: isValid });
  } catch (error:any) {
    if (error.message === "Invalid admin passkey") {
      res.status(401).json({ valid: false, message: error.message });
      return 
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
  }