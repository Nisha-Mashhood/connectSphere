import { loginUser, forgotPassword, verifyOTP, resetPassword, refreshToken as refeshTokenService, logout as logoutUserService, sigupDetails, } from "../services/auth.service.js";
import { clearCookies, setTokensInCookies } from "../utils/jwt.utils.js";
// import mongoose from "mongoose";
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
        const { useremail } = req.body; // Get userId from the request body
        console.log(useremail);
        // if (!useremail) {
        //    res.status(400).json({ message: "User email is required." });
        //    return
        // }
        // Validate if the userId is a valid ObjectId
        // if (!mongoose.Types.ObjectId.isValid(userId)) {
        //    res.status(400).json({ message: "Invalid User ID." });
        //    return
        // }
        // Call the logout service to remove the refresh token
        await logoutUserService(useremail);
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
        const { email, newPassword } = req.body;
        await resetPassword(email, newPassword);
        res.status(200).json({ message: "Password reset successfully." });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//# sourceMappingURL=auth.controller.js.map