import { loginUser, forgotPassword, verifyOTP, resetPassword, refreshToken as refeshTokenService, logout as logoutUserService, sigupDetails, verifyAdminPasskey, checkProfileCompletion, profileDetails, updateUserProfile, } from "../services/auth.service.js";
import { clearCookies, setTokensInCookies } from "../utils/jwt.utils.js";
// import { findUserByEmail } from "../repositories/user.repositry.js";
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