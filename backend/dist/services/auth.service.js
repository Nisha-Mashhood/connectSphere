import { createUser, findUserByEmail, updatePassword, updateRefreshToken, findUserById, isProfileComplete, updateUser, incrementLoginCount, } from "../repositories/user.repositry.js";
import bcrypt from "bcryptjs";
import { AuthService as JWTService } from "../Modules/Auth/Utils/JWT.js";
import { generateOTP } from "../Modules/Auth/Utils/OTP.js";
import { sendEmail } from "../core/Utils/Email.js";
import config from "../config/env.config.js";
import { uploadMedia } from "../core/Utils/Cloudinary.js";
import { OAuth2Client } from "../Modules/Auth/Utils/GoogleConfig.js";
import axios from "axios";
const gitclientId = config.githubclientid;
const gitclientSecret = config.githubclientsecret;
const jwtservice = new JWTService();
// Handle Registration with details
export const sigupDetails = async (data) => {
    const { name, email, password } = data;
    // Check if the email already exists
    const userExists = await findUserByEmail(email);
    if (userExists)
        throw new Error("User already exists.");
    //create new user with the passed details
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({ name, email, password: hashedPassword });
    return newUser;
};
// Handle login logic
export const loginUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found");
    if (user.isBlocked) {
        throw new Error("Blocked");
    }
    if (!user.password) {
        throw new Error("This account is registered using a third-party provider. Please log in with your provider.");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    await incrementLoginCount(user._id.toString());
    const updatedUser = await findUserById(user._id.toString());
    if (!updatedUser)
        throw new Error("User not found after login count update");
    console.log(`[AuthService] User ${email} logged in. loginCount: ${updatedUser.loginCount}`);
    const accessToken = jwtservice.generateAccessToken({
        userId: user._id,
        userRole: user.role,
    });
    const refreshToken = jwtservice.generateRefreshToken({
        userId: user._id,
        userRole: user.role,
    });
    await updateRefreshToken(user._id.toString(), refreshToken);
    const needsReviewPrompt = updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
    console.log(`[AuthService] Needs review prompt for ${email}: ${needsReviewPrompt}`);
    return { user: updatedUser, accessToken, refreshToken, needsReviewPrompt };
};
// Handle refresh token logic
export const refreshToken = async (refreshToken) => {
    try {
        // Verify the refresh token
        const decoded = jwtservice.verifyRefreshToken(refreshToken);
        // Generate a new access token
        const newAccessToken = jwtservice.generateAccessToken({ userId: decoded.userId });
        return { newAccessToken };
    }
    catch (error) {
        throw new Error("Invalid or expired refresh token.");
    }
};
//Handles google signin
export const googleSignupService = async (code) => {
    // Exchange code for tokens
    const { tokens } = await OAuth2Client.getToken(code);
    OAuth2Client.setCredentials(tokens);
    // Fetch user info from Google
    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
    const { email, name, picture } = userRes.data;
    // Check if the email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error("Email already registered.");
    }
    // Create a new user using the repository
    const newUser = await createUser({
        name,
        email,
        provider: "google",
        providerId: tokens.id_token,
        profilePic: picture,
        password: null, // No password for Google users
    });
    return newUser;
};
// Handle Google login
export const googleLoginService = async (code) => {
    try {
        const { tokens } = await OAuth2Client.getToken(code);
        OAuth2Client.setCredentials(tokens);
        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
        const { email } = userRes.data;
        const existingUser = await findUserByEmail(email);
        if (!existingUser) {
            throw new Error("Email not registered");
        }
        await incrementLoginCount(existingUser._id.toString());
        const updatedUser = await findUserById(existingUser._id.toString());
        if (!updatedUser)
            throw new Error("User not found after login count update");
        console.log(`[AuthService] Google login for ${email}. loginCount: ${updatedUser.loginCount}`);
        const accessToken = jwtservice.generateAccessToken({
            userId: existingUser._id,
            userRole: existingUser.role,
        });
        const refreshToken = jwtservice.generateRefreshToken({
            userId: existingUser._id,
            userRole: existingUser.role,
        });
        await updateRefreshToken(existingUser._id.toString(), refreshToken);
        const needsReviewPrompt = updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
        console.log(`[AuthService] Needs review prompt for ${email}: ${needsReviewPrompt}`);
        return { user: updatedUser, accessToken, refreshToken, needsReviewPrompt };
    }
    catch (error) {
        console.error("[AuthService] Google login error:", error.message);
        throw new Error(error.message || "Google login failed.");
    }
};
//Handles github signup
export const githubSignupService = async (code) => {
    try {
        // Step 1: Exchange code for access token
        const tokenResponse = await axios.post(`https://github.com/login/oauth/access_token`, {
            client_id: gitclientId,
            client_secret: gitclientSecret,
            code,
        }, {
            headers: {
                Accept: "application/json",
            },
        });
        const { access_token } = tokenResponse.data;
        // Step 2: Fetch user details from GitHub
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const { login: githubUsername, email: initialEmail, avatar_url: profilePic, name, } = userResponse.data;
        let email = initialEmail;
        // Step 3: Fetch emails explicitly if not included in the initial response
        if (!email) {
            const emailsResponse = await axios.get("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const primaryEmail = emailsResponse.data.find((e) => e.primary);
            if (primaryEmail) {
                email = primaryEmail.email;
            }
            else {
                throw new Error("Email not found for GitHub user.");
            }
        }
        // Step 4: Check if the email already exists in the database
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            throw new Error("Email already registered.");
        }
        // Step 5: Create a new user
        const newUser = await createUser({
            name,
            email,
            provider: "github",
            providerId: githubUsername,
            profilePic,
            password: null, // Password is null since this is an OAuth signup
        });
        return newUser;
    }
    catch (error) {
        console.error("GitHub Signup Error:", error.message);
        throw new Error(error.message || "GitHub authentication failed.");
    }
};
// Handle GitHub login
export const githubLoginService = async (code) => {
    try {
        const tokenResponse = await axios.post(`https://github.com/login/oauth/access_token`, {
            client_id: gitclientId,
            client_secret: gitclientSecret,
            code,
        }, {
            headers: {
                Accept: "application/json",
            },
        });
        const { access_token } = tokenResponse.data;
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        let email = userResponse.data.email;
        if (!email) {
            const emailsResponse = await axios.get("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const primaryEmail = emailsResponse.data.find((e) => e.primary);
            if (primaryEmail) {
                email = primaryEmail.email;
            }
            else {
                throw new Error("Email not found for GitHub user.");
            }
        }
        const existingUser = await findUserByEmail(email);
        if (!existingUser) {
            throw new Error("Email not registered.");
        }
        await incrementLoginCount(existingUser._id.toString());
        const updatedUser = await findUserById(existingUser._id.toString());
        if (!updatedUser)
            throw new Error("User not found after login count update");
        console.log(`[AuthService] GitHub login for ${email}. loginCount: ${updatedUser.loginCount}`);
        const accessToken = jwtservice.generateAccessToken({
            userId: existingUser._id,
            userRole: existingUser.role,
        });
        const refreshToken = jwtservice.generateRefreshToken({
            userId: existingUser._id,
            userRole: existingUser.role,
        });
        await updateRefreshToken(existingUser._id.toString(), refreshToken);
        const needsReviewPrompt = updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
        console.log(`[AuthService] Needs review prompt for ${email}: ${needsReviewPrompt}`);
        return { user: updatedUser, accessToken, refreshToken, needsReviewPrompt };
    }
    catch (error) {
        console.error("GitHub Login Error:", error.message);
        throw new Error(error.message || "GitHub login failed.");
    }
};
//Handle forgot password
const otpStore = {}; // Temporary storage for OTPs
export const forgotPassword = async (email) => {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found.");
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
    return jwtservice.generateAccessToken({ email }, "10m"); // Temporary token for resetting password
};
//Handle reset password
export const resetPassword = async (email, newPassword) => {
    const user = await findUserByEmail(email);
    if (!user)
        throw new Error("User not found.");
    //Compare the old password with the new one
    const isSamePassword = await bcrypt.compare(newPassword, user.password || "");
    if (isSamePassword)
        throw new Error("New password cannot be the same as the old password.");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(user._id.toString(), hashedPassword);
};
//Handle logout
export const logout = async (useremail) => {
    try {
        // Call the removeRefreshToken function
        await jwtservice.removeRefreshToken(useremail);
    }
    catch (error) {
        throw new Error("Error during logout: " + error.message);
    }
};
//Check passcode for admin
export const verifyAdminPasskey = (passkey) => {
    if (passkey === config.adminpasscode) {
        return true;
    }
    else {
        throw new Error("Invalid admin passkey");
    }
};
// Check profile completion
export const checkProfileCompletion = async (userId) => {
    // Fetch user from the database
    const user = await findUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // Check if the profile is complete using the repository logic
    return isProfileComplete(user);
};
//  profile Details
export const profileDetails = async (userId) => {
    // Fetch user from the database
    const user = await findUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
export const updateUserProfile = async (userId, data) => {
    const user = await findUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    // Upload images to Cloudinary if provided
    let profilePicUrl = user.profilePic;
    let coverPicUrl = user.coverPic;
    if (data.profilePicFile) {
        const { url } = await uploadMedia(data.profilePicFile.path, "profiles", data.profilePicFile.size);
        profilePicUrl = url;
    }
    if (data.coverPicFile) {
        const { url } = await uploadMedia(data.coverPicFile.path, "covers", data.coverPicFile.size);
        coverPicUrl = url;
    }
    // Update user data
    const updatedData = {
        name: data.name || user.name,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : user.dateOfBirth,
        jobTitle: data.jobTitle || user.jobTitle,
        industry: data.industry || user.industry,
        reasonForJoining: data.reasonForJoining || user.reasonForJoining,
        profilePic: profilePicUrl,
        coverPic: coverPicUrl,
    };
    console.log(updatedData);
    const updatedUser = await updateUser(userId, updatedData);
    return updatedUser;
};
//# sourceMappingURL=auth.service.js.map