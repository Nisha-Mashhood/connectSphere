import User from "../../../models/user.model.js";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { RepositoryError } from "../../../core/Utils/ErrorHandler.js";
import logger from "../../../core/Utils/Logger.js";
// Repository for User-specific database operations
export class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }
    // Create a new user
    createUser = async (userData) => {
        try {
            return await this.create(userData);
        }
        catch (error) {
            logger.error(`Error creating user: ${error}`);
            throw new RepositoryError("Failed to create user");
        }
    };
    // Find a user by email
    findUserByEmail = async (email) => {
        try {
            return await this.findOne({ email });
        }
        catch (error) {
            logger.error(`Error finding user by email ${email}: ${error}`);
            throw new RepositoryError(`Failed to find user by email ${email}`);
        }
    };
    //Find a User By id
    getUserById = async (id) => {
        if (!id) {
            throw new RepositoryError("id is not provided");
        }
        try {
            return await this.findById(id);
        }
        catch (error) {
            logger.error(`Error finding user by id ${id}: ${error}`);
            throw new RepositoryError(`Failed to find user by id ${id}`);
        }
    };
    // Find or create a user by OAuth profile
    findOrCreateUser = async (profile, provider) => {
        try {
            const email = profile.email;
            let user = await this.findUserByEmail(email);
            if (!user) {
                user = await this.create({
                    name: profile.displayName || "Unknown",
                    email,
                    provider,
                    providerId: profile.id,
                    profilePic: profile.photos?.[0]?.value || null,
                    role: "user",
                });
                logger.info(`Created OAuth user: ${email} via ${provider}`);
            }
            return user;
        }
        catch (error) {
            logger.error(`Error in findOrCreateUser for ${profile.email}: ${error}`);
            throw new RepositoryError(`Failed to find or create user for ${profile.email}`);
        }
    };
    // Update user password
    updatePassword = async (id, password) => {
        try {
            return await this.update(id, { password });
        }
        catch (error) {
            logger.error(`Error updating password for user ${id}: ${error}`);
            throw new RepositoryError(`Failed to update password for user ${id}`);
        }
    };
    // Increment login count
    incrementLoginCount = async (userId) => {
        try {
            return await this.findByIdAndUpdate(userId, { $inc: { loginCount: 1 } });
        }
        catch (error) {
            logger.error(`Error incrementing login count for user ${userId}: ${error}`);
            throw new RepositoryError(`Failed to increment login count for user ${userId}`);
        }
    };
    // Update refresh token
    updateRefreshToken = async (userId, refreshToken) => {
        try {
            return await this.update(userId, { refreshToken });
        }
        catch (error) {
            logger.error(`Error updating refresh token for user ${userId}: ${error}`);
            throw new RepositoryError(`Failed to update refresh token for user ${userId}`);
        }
    };
    // Remove refresh token
    removeRefreshToken = async (email) => {
        try {
            await this.model.updateOne({ email }, { $unset: { refreshToken: "" } });
            logger.info(`Removed refresh token for user with email: ${email}`);
        }
        catch (error) {
            logger.error(`Error removing refresh token for email ${email}: ${error}`);
            throw new RepositoryError(`Failed to remove refresh token for email ${email}`);
        }
    };
    // Check if profile is complete
    isProfileComplete = async (user) => {
        try {
            const requiredFields = [
                "phone",
                "dateOfBirth",
                "jobTitle",
                "industry",
                "reasonForJoining",
            ];
            for (const field of requiredFields) {
                if (!user[field]) {
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            logger.error(`Error checking profile completion for user ${user._id}: ${error}`);
            throw new RepositoryError(`Failed to check profile completion for user ${user._id}`);
        }
    };
    //Fetch All User Details
    getAllUsers = async () => {
        try {
            logger.debug(`Fetching all users`);
            return await this.model.find({ role: { $ne: "admin" } }).exec();
        }
        catch (error) {
            logger.error(`Error fetching all users: ${error}`);
            throw new RepositoryError("Failed to fetch all users");
        }
    };
    //Update The User Profile
    updateUserProfile = async (id, data) => {
        try {
            logger.debug(`Updating user profile for ID: ${id}`);
            return await this.findByIdAndUpdate(id, data, { new: true });
        }
        catch (error) {
            logger.error(`Error updating user profile for ID ${id}: ${error}`);
            throw new RepositoryError(`Failed to update user profile for ID ${id}`);
        }
    };
    //Block the given User
    blockUser = async (id) => {
        try {
            logger.debug(`Blocking user: ${id}`);
            await this.findByIdAndUpdate(id, { isBlocked: true });
        }
        catch (error) {
            logger.error(`Error blocking user ${id}: ${error}`);
            throw new RepositoryError(`Failed to block user ${id}`);
        }
    };
    //Unblock the given user
    unblockUser = async (id) => {
        try {
            logger.debug(`Unblocking user: ${id}`);
            await this.findByIdAndUpdate(id, { isBlocked: false });
        }
        catch (error) {
            logger.error(`Error unblocking user ${id}: ${error}`);
            throw new RepositoryError(`Failed to unblock user ${id}`);
        }
    };
    //Update The user Role
    updateUserRole = async (userId, role) => {
        try {
            logger.debug(`Updating role for user: ${userId} to ${role}`);
            return await this.findByIdAndUpdate(userId, { role }, { new: true });
        }
        catch (error) {
            logger.error(`Error updating role for user ${userId}: ${error}`);
            throw new RepositoryError(`Failed to update role for user ${userId}`);
        }
    };
}
//# sourceMappingURL=UserRepositry.js.map