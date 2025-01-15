import { loginUser, forgotPassword, verifyOTP, resetPassword, refreshToken as refeshTokenService, logout as logoutUserService, sigupDetails, verifyAdminPasskey, checkProfileCompletion, profileDetails, updateUserProfile, } from "../services/auth.service.js";
import { clearCookies, generateAccessToken, generateRefreshToken, setTokensInCookies } from "../utils/jwt.utils.js";
import { OAuth2Client } from 'google-auth-library';
import { findUserByEmail, updateRefreshToken } from "../repositories/user.repositry.js";
import config from '../config/env.config.js';
//Handles the personal details Registration
export const signup = async (req, res) => {
    try {
        const user = await sigupDetails(req.body);
        console.log("Registered User Details:", user);
        res.status(201).json({
            message: "User Registered Successfully"
        });
    }
    catch (error) {
        console.error("Signup Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};
// Handle user login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        //console.log(req.body);
        const { user, accessToken, refreshToken } = await loginUser(email, password);
        // Store tokens in cookies
        setTokensInCookies(res, accessToken, refreshToken);
        res.json({ message: "Login successful", user });
    }
    catch (error) {
        if (error.message === "User not found") {
            res.status(404).json({ message: error.message });
            return;
        }
        if (error.message === "Blocked") {
            res.status(403).json({ message: error.message });
            return;
        }
        if (error.message === "Invalid credentials") {
            res.status(401).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const client = new OAuth2Client({
    clientId: config.googleclientid,
    clientSecret: config.googleclientsecret,
    redirectUri: config.googleredirecturi
});
// Google Signup Controller
export const googleSignup = async (req, res) => {
    try {
        const { code } = req.body;
        console.log("code:", code);
        console.log("redirect URI:", config.googleredirecturi); // Debug log
        const { tokens } = await client.getToken({
            code,
            redirect_uri: config.googleredirecturi
        });
        if (!tokens.id_token) {
            res.status(400).json({ success: false, message: 'Invalid ID token' });
            return;
        }
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.googleclientid,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({ success: false, message: 'Unable to retrieve user details' });
            return;
        }
        console.log("Google User Payload:", payload);
        // Exchange the authorization code for tokens
        // const { tokens } = await client.getToken(code);
        // if (!tokens.id_token) {
        //   res.status(400).json({ success: false, message: 'Invalid ID token' });
        //   return 
        // }
        //   // Verify Google token
        //   const ticket = await client.verifyIdToken({
        //     idToken: tokens.id_token,
        //     audience: '262075947289-6uk3rlr59rq0218rf8nqggmgeb6aibtv.apps.googleusercontent.com',
        //   });
        //   const payload = ticket.getPayload();
        //   if (!payload) {
        //     res.status(400).json({ success: false, message: 'Unable to retrieve user details' });
        //     return 
        //   }
        //   const { email, name, picture, sub } = payload;
        //   // Check if user already exists
        //   const userExists = await findUserByEmail(email!);
        //   if (userExists) {
        //     res.status(400).json({ 
        //       message: "Email already registered. Please login instead."  
        //     });
        //     return 
        //   }
        //   // Create new user
        //   const newUser = await createUser({
        //     name,
        //     email,
        //     profilePic: picture,
        //     provider: 'google',
        //     providerId: sub
        //   });
        //   res.status(201).json({
        //     message: "User registered successfully",
        //     user: newUser
        //   });
    }
    catch (error) {
        console.error("Google Signup Error:", error);
        res.status(400).json({ message: error.message });
    }
};
// Google Login Controller
export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: "262075947289-6uk3rlr59rq0218rf8nqggmgeb6aibtv.apps.googleusercontent.com"
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Invalid Google token");
        }
        const { email } = payload;
        // Find user by email
        const user = await findUserByEmail(email);
        if (!user) {
            res.status(404).json({
                message: "No account found with this email. Please sign up first."
            });
            return;
        }
        if (user.isBlocked) {
            throw new Error("Blocked");
        }
        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user._id,
            userRole: user.role
        });
        const refreshToken = generateRefreshToken({
            userId: user._id,
            userRole: user.role
        });
        // Save refresh token
        await updateRefreshToken(user._id.toString(), refreshToken);
        // Set cookies
        setTokensInCookies(res, accessToken, refreshToken);
        res.json({
            message: "Login successful",
            user
        });
    }
    catch (error) {
        console.error("Google Login Error:", error);
        if (error.message === "Blocked") {
            res.status(403).json({ message: "Your account has been blocked" });
            return;
        }
        res.status(400).json({ message: error.message });
    }
};
// Handle refresh token logic
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body; //refresh token is passed in the request body
        const { newAccessToken } = await refeshTokenService(refreshToken);
        res.json({ message: "Access token refreshed.", newAccessToken });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const checkProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const isComplete = await checkProfileCompletion(userId);
        res.status(200).json({ isProfileComplete: isComplete });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
export const getprofileDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const userDetails = await profileDetails(userId);
        res.status(200).json({
            message: "Profile details accessed successfully",
            userDetails,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const updateUserDetails = async (req, res) => {
    try {
        const id = req.params.Id;
        const { name, email, phone, dateOfBirth, jobTitle, industry, reasonForJoining } = req.body;
        // Uploaded files (from multer)
        const profilePicFile = req.files?.["profilePic"]?.[0];
        const coverPicFile = req.files?.["coverPic"]?.[0];
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
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// Google Auth Redirect
export const googleAuthRedirect = (req, res) => {
    const user = req.user;
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
export const githubAuthRedirect = (req, res) => {
    const user = req.user;
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
export const logout = async (req, res) => {
    try {
        const { email } = req.body; // Get email from the request body
        if (!email) {
            res.status(400).json({ message: "email is required." });
            return;
        }
        // Call the logout service to remove the refresh token
        await logoutUserService(email);
        // Clear cookies
        clearCookies(res);
        res.status(200).json({ message: "Logged out successfully." });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//Handle forgot password
export const handleForgotPassword = async (req, res) => {
    try {
        console.log(req.body);
        const { email } = req.body;
        const otp = await forgotPassword(email);
        res.status(200).json({ message: "OTP sent to email.", otp });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//Handles verify OTP
export const handleVerifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const token = await verifyOTP(email, otp);
        res.status(200).json({ message: "OTP verified.", token });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//Handles Reset Password
export const handleResetPassword = async (req, res) => {
    try {
        console.log(req.body);
        const { email, newPassword } = req.body;
        await resetPassword(email, newPassword);
        res.status(200).json({ message: "Password reset successfully." });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// export const checkingBlockedStatus = async(req:Request,res:Response) =>{
//   const { email }= req.body;
//   if(!email){
//     res.status(400).json({ message: "Email is required" });
//     return
//   }
//   try {
//     const user = await findUserByEmail(email);
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return
//     }
//     if (user.isBlocked) {
//       res.status(403).json({ message: "User is blocked" });
//       return
//     }
//     res.status(200).json({ message: "User is active" });
//     return
//   } catch (error) {
//     res.status(500).json({ message: "Error checking user status", error });
//     console.log("Error in checking status")
//     return 
//   }
// }
export const verifyPasskey = async (req, res) => {
    try {
        const { passkey } = req.body;
        const isValid = verifyAdminPasskey(passkey);
        res.status(200).json({ valid: isValid });
    }
    catch (error) {
        if (error.message === "Invalid admin passkey") {
            res.status(401).json({ valid: false, message: error.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
//# sourceMappingURL=auth.controller.js.map