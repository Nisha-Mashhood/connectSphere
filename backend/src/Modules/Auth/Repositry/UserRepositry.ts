import User from "../../../models/user.model.js";
import { UserInterface } from "../../../Interfaces/models/IUser.js";
import { BaseRepository } from "../../../core/Repositries/BaseRepositry.js";
import { RepositoryError } from "../../../core/Utils/ErrorHandler.js";
import logger from "../../../core/Utils/Logger.js";


// Repository for User-specific database operations
export class UserRepository extends BaseRepository<UserInterface> {
  constructor() {
    super(User);
  }

  // Create a new user
  async createUser(userData: Partial<UserInterface>): Promise<UserInterface> {
    try {
      return await this.create(userData);
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      throw new RepositoryError('Failed to create user');
    }
  }

  // Find a user by email
  async findUserByEmail(email: string): Promise<UserInterface | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      logger.error(`Error finding user by email ${email}: ${error}`);
      throw new RepositoryError(`Failed to find user by email ${email}`);
    }
  }

  // Find or create a user by OAuth profile
  async findOrCreateUser(profile: { email: string; displayName?: string; id?: string; photos?: { value: string }[] }, provider: string): Promise<UserInterface> {
    try {
      const email = profile.email;
      let user = await this.findUserByEmail(email);
      if (!user) {
        user = await this.create({
          name: profile.displayName || 'Unknown',
          email,
          provider,
          providerId: profile.id,
          profilePic: profile.photos?.[0]?.value || null,
          role: 'user',
        });
        logger.info(`Created OAuth user: ${email} via ${provider}`);
      }
      return user;
    } catch (error) {
      logger.error(`Error in findOrCreateUser for ${profile.email}: ${error}`);
      throw new RepositoryError(`Failed to find or create user for ${profile.email}`);
    }
  }

  // Update user password
  async updatePassword(id: string, password: string): Promise<UserInterface | null> {
    try {
      return await this.update(id, { password });
    } catch (error) {
      logger.error(`Error updating password for user ${id}: ${error}`);
      throw new RepositoryError(`Failed to update password for user ${id}`);
    }
  }

  // Increment login count
  async incrementLoginCount(userId: string): Promise<UserInterface | null> {
    try {
      return await this.findByIdAndUpdate(userId, { $inc: { loginCount: 1 } });
    } catch (error) {
      logger.error(`Error incrementing login count for user ${userId}: ${error}`);
      throw new RepositoryError(`Failed to increment login count for user ${userId}`);
    }
  }

  // Update refresh token
  async updateRefreshToken(userId: string, refreshToken: string): Promise<UserInterface | null> {
    try {
      return await this.update(userId, { refreshToken });
    } catch (error) {
      logger.error(`Error updating refresh token for user ${userId}: ${error}`);
      throw new RepositoryError(`Failed to update refresh token for user ${userId}`);
    }
  }

  // Remove refresh token
  async removeRefreshToken(email: string): Promise<void> {
    try {
      await this.model.updateOne({ email }, { $unset: { refreshToken: '' } });
      logger.info(`Removed refresh token for user with email: ${email}`);
    } catch (error) {
      logger.error(`Error removing refresh token for email ${email}: ${error}`);
      throw new RepositoryError(`Failed to remove refresh token for email ${email}`);
    }
  }

  // Check if profile is complete
  async isProfileComplete(user: UserInterface): Promise<boolean> {
    try {
      const requiredFields: (keyof UserInterface)[] = ['phone', 'dateOfBirth', 'jobTitle', 'industry', 'reasonForJoining'];
      for (const field of requiredFields) {
        if (!user[field]) {
          return false;
        }
      }
      return true;
    } catch (error) {
      logger.error(`Error checking profile completion for user ${user._id}: ${error}`);
      throw new RepositoryError(`Failed to check profile completion for user ${user._id}`);
    }
  }
}