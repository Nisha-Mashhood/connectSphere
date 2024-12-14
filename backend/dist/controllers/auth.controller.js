import { savePersonalDetails, saveAccountDetails, saveProfessionalDetails, saveReasonAndRole, loginUser, forgotPassword, verifyOTP, resetPassword, refreshToken as refeshTokenService, logout as logoutUserService, } from "../services/auth.service.js";
//Handles the personal details Registration
export const registerPersonalDetails = async (req, res) => {
    try {
        const personalDetails = await savePersonalDetails(req.body);
        res
            .status(201)
            .json({
            message: "Personal details saved.",
            userId: personalDetails._id,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//Handles the Account Details Registration
export const registerAccountDetails = async (req, res) => {
    try {
        const user = await saveAccountDetails(req.body);
        res.status(200).json({ message: "Account details saved.", user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//Handles the professional Details Registration
export const registerProfessionalDetails = async (req, res) => {
    try {
        const user = await saveProfessionalDetails(req.body);
        res.status(200).json({ message: "Professional details saved.", user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//Handles the Reason and Role registration
export const registerReasonAndRole = async (req, res) => {
    try {
        const user = await saveReasonAndRole(req.body);
        res.status(200).json({ message: "Reason and role saved.", user });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// Handle user login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        //console.log(req.body);
        const { user, accessToken, refreshToken } = await loginUser(email, password);
        res.json({ message: "Login successful", user, accessToken, refreshToken });
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
// Handle logout logic
export const logout = async (req, res) => {
    try {
        const userId = req.body.userId; // Get userId from the request body (or from JWT)
        // Call the logout service to remove the refresh token
        await logoutUserService(userId);
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