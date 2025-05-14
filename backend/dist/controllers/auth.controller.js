import { loginUser, forgotPassword, verifyOTP, resetPassword, refreshToken as refeshTokenService, logout as logoutUserService, sigupDetails, verifyAdminPasskey, checkProfileCompletion, profileDetails, updateUserProfile, googleSignupService, googleLoginService, githubLoginService, githubSignupService } from "../services/auth.service.js";
import { clearCookies, setTokensInCookies } from "../utils/jwt.utils.js";
//Handles the Registration
export const signup = async (req, res) => {
    try {
        await sigupDetails(req.body);
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
        const { user, accessToken, refreshToken, needsReviewPrompt } = await loginUser(email, password);
        // Store tokens in cookies
        setTokensInCookies(res, accessToken, refreshToken);
        res.json({ message: "Login successful", user, needsReviewPrompt });
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
        if (error.message === "This account is registered using a third-party provider. Please log in with your provider.") {
            res.status(404).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
// Google Signup Controller
export const googleSignup = async (req, res) => {
    try {
        const { code } = req.body;
        const newUser = await googleSignupService(code);
        res.status(201).json({ message: "User signed up successfully", user: newUser });
    }
    catch (error) {
        console.error("Google Signup Error:", error.message);
        res.status(500).json({ message: "Google signup failed.", error: error.message });
    }
};
// Google Login Controller
export const googleLogin = async (req, res) => {
    try {
        const { code } = req.body;
        const { user, accessToken, refreshToken, needsReviewPrompt } = await googleLoginService(code);
        // Store tokens in cookies
        setTokensInCookies(res, accessToken, refreshToken);
        res.status(200).json({
            message: "Google login successful",
            user,
            accessToken,
            refreshToken,
            needsReviewPrompt,
        });
    }
    catch (error) {
        if (error.message === "Email not registered") {
            res.status(404).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Google login failed.", error: error.message });
        }
        return;
    }
};
//Handles github Signup
export const githubSignup = async (req, res) => {
    try {
        const { code } = req.body;
        console.log("Code received for signup:", code);
        const newUser = await githubSignupService(code);
        res.status(201).json({ message: "User signed up successfully", user: newUser });
    }
    catch (error) {
        console.error("Github Signup Error:", error.message);
        res.status(500).json({ message: "Github signup failed.", error: error.message });
        return;
    }
};
//Handles github login
export const githubLogin = async (req, res) => {
    try {
        const { code } = req.body;
        const { user, accessToken, refreshToken, needsReviewPrompt } = await githubLoginService(code);
        // Store tokens in cookies
        setTokensInCookies(res, accessToken, refreshToken);
        res.status(200).json({
            message: "Github login successful",
            user,
            accessToken,
            refreshToken,
            needsReviewPrompt,
        });
    }
    catch (error) {
        if (error.message === "Email not registered") {
            res.status(404).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Github login failed.", error: error.message });
        }
        return;
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
        const updateData = req.body;
        // Uploaded files (from multer)
        const profilePicFile = req.files?.["profilePic"]?.[0];
        const coverPicFile = req.files?.["coverPic"]?.[0];
        if (profilePicFile)
            updateData.profilePicFile = profilePicFile;
        if (coverPicFile)
            updateData.coverPicFile = coverPicFile;
        const updatedUser = await updateUserProfile(id, updateData);
        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
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