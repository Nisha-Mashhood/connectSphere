import { injectable } from "inversify";
import User from "../Models/user-model";
import { IUser } from '../Interfaces/Models/i-user';
import { BaseRepository } from "../core/Repositries/base-repositry";
import { RepositoryError } from "../core/Utils/error-handler";
import logger from "../core/Utils/logger";
import { UserQuery } from "../Utils/Types/auth-types";
import { Model } from "mongoose";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { StatusCodes } from "../enums/status-code-enums";

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository{
  constructor() {
    super(User as Model<IUser>);
  }

  // Create a new user
   public createUser=async(userData: Partial<IUser>): Promise<IUser> =>{
    try {
      return await this.create(userData);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating user ${userData.email}`, err);
      throw new RepositoryError('Error creating user', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  // Find a user by email
   public findUserByEmail=async(email: string): Promise<IUser | null> =>{
    try {
      logger.debug(`Fetching user by email: ${email}`);
      const user = await this.findOne({ email });
      if (!user) {
      logger.info(`No user found with email: ${email}`);
      return null;
    }
      logger.info(`User fetched: ${user._id} (${email})`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching user by email ${email}`, err);
      throw new RepositoryError('Error fetching user by email', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  //Find a User By id
   public getUserById=async(id?: string): Promise<IUser> =>{
    if (!id) {
      logger.warn('Missing ID for getUserById');
      throw new RepositoryError('Invalid ID: ID is required', StatusCodes.BAD_REQUEST);
    }
    try {
      const user = await this.findById(id);
      if (!user) {
        logger.warn(`User not found: ${id}`);
        throw new RepositoryError(`User not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User fetched: ${id} (${user.email})`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching user by ID ${id}`, err);
      throw new RepositoryError('Error fetching user by ID', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  // Find or create a user by OAuth profile
   public findOrCreateUser=async(
    profile: {
      email: string;
      displayName?: string;
      id?: string;
      photos?: { value: string }[];
    },
    provider: string
  ): Promise<IUser> =>{
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in findOrCreateUser for ${profile.email}`, err);
      throw new RepositoryError('Error finding or creating user', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  // Update user password
   public updatePassword=async(
    id: string,
    password: string
  ): Promise<IUser | null> =>{
    try {
      logger.debug(`Updating password for user: ${id}`);
      const user = await this.update(id, { password });
      if (!user) {
        logger.warn(`User not found: ${id}`);
        throw new RepositoryError(`User not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Password updated for user: ${id}`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating password for user ${id}`, err);
      throw new RepositoryError('Error updating password', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  // Increment login count
   public incrementLoginCount=async(userId: string): Promise<IUser | null> =>{
    try {
      logger.debug(`Incrementing login count for user: ${userId}`);
      const user = await this.findByIdAndUpdate(userId, { $inc: { loginCount: 1 } }, { new: true });
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        throw new RepositoryError(`User not found with ID: ${userId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Login count incremented for user: ${userId}`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error incrementing login count for user ${userId}`, err);
      throw new RepositoryError('Error incrementing login count', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  // Update refresh token
   public updateRefreshToken = async (userId: string, refreshToken: string): Promise<IUser | null> => {
    try {
      logger.debug(`Updating refresh token for user: ${userId}`);
      const user = await this.update(userId, { refreshToken });
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        throw new RepositoryError(`User not found with ID: ${userId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Refresh token updated for user: ${userId}`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating refresh token for user ${userId}`, err);
      throw new RepositoryError('Error updating refresh token', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  // Remove refresh token
   public removeRefreshToken = async (email: string): Promise<IUser | null> => {
    try {
      logger.debug(`Removing refresh token for user with email: ${email}`);
      const user = await this.model.findOneAndUpdate({ email }, { $unset: { refreshToken: '' } }, { new: true });
      if (!user) {
        logger.warn(`User not found with email: ${email}`);
        throw new RepositoryError(`User not found with email: ${email}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Refresh token removed for user: ${user._id} (${email})`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error removing refresh token for email ${email}`, err);
      throw new RepositoryError('Error removing refresh token', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  // Check if profile is complete
   public isProfileComplete = async (user: IUser): Promise<boolean> => {
    try {
      logger.debug(`Checking profile completion for user: ${user._id}`);
      const requiredFields: (keyof IUser)[] = [
        'phone',
        'dateOfBirth',
        'jobTitle',
        'industry',
        'reasonForJoining',
      ];
      for (const field of requiredFields) {
        if (!user[field]) {
          logger.info(`Profile incomplete for user: ${user._id} (${user.email}) - missing ${field}`);
          return false;
        }
      }
      logger.info(`Profile complete for user: ${user._id} (${user.email})`);
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error checking profile completion for user ${user._id}`, err);
      throw new RepositoryError('Error checking profile completion', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }


  public getAllAdmins = async (): Promise<IUser[]> => {
    try {
      logger.debug(`Fetching all admin users`);
      const users = await this.model.find({ role: 'admin' }).exec();
      logger.info(`Fetched ${users.length} admin users`);
      return users;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching admin users`, err);
      throw new RepositoryError('Error fetching admin users', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

    public fetchAllUsers = async (): Promise<IUser[]> => {
    try {
      logger.debug(`Fetching all users`);
      const users = await this.model.find({ role: { $ne: 'admin' } }).exec();
      logger.info(`Fetched ${users.length} users`);
      return users;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching users`, err);
      throw new RepositoryError('Error fetching users', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  //Fetch All User Details
   public getAllUsers = async (query: UserQuery = {}): Promise<{ users: IUser[]; total: number }> => {
    try {
      logger.debug(`Fetching all users with query: ${JSON.stringify(query)}`);
      const { search, page, limit, excludeId } = query;

      if (!search && !page && !limit) {
        const users = await this.model.find({ role: { $ne: 'admin' } }).exec();
        logger.info(`Fetched ${users.length} users`);
        return { users, total: users.length };
      }

      const matchStage: Record<string, any> = { role: { $ne: 'admin' } };
      if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: `^${search}`, $options: 'i' } },
        { industry: { $regex: `^${search}`, $options: 'i' } },
        { reasonForJoining: { $regex: `^${search}`, $options: 'i' } },
      ];
    }
    if (excludeId) {
      matchStage._id = { $ne: excludeId };
    }

      const pipeline = [
        { $match: matchStage },
        {
          $facet: {
            users: [
              { $skip: ((page || 1) - 1) * (limit || 10) },
              { $limit: limit || 10 },
            ],
            total: [{ $count: 'count' }],
          },
        },
      ];

      const result = await this.model.aggregate(pipeline).exec();
      const users = result[0]?.users || [];
      const total = result[0]?.total[0]?.count || 0;

      logger.info(`Fetched ${users.length} users, total: ${total}`);
      return { users, total };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching all users`, err);
      throw new RepositoryError('Error fetching all users', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  //Update The User Profile
   public updateUserProfile = async (id: string, data: Partial<IUser>): Promise<IUser | null> => {
    try {
      logger.debug(`Updating user profile for ID: ${id}`);
      const user = await this.findByIdAndUpdate(id, data, { new: true });
      if (!user) {
        logger.warn(`User not found: ${id}`);
        throw new RepositoryError(`User not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User profile updated: ${id} (${user.email})`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating user profile for ID ${id}`, err);
      throw new RepositoryError('Error updating user profile', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  //Block the given User
   public blockUser = async (id: string): Promise<IUser | null> => {
    try {
      logger.debug(`Blocking user: ${id}`);
      const user = await this.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
      if (!user) {
        logger.warn(`User not found: ${id}`);
        throw new RepositoryError(`User not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User blocked: ${id} (${user.email})`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error blocking user ${id}`, err);
      throw new RepositoryError('Error blocking user', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  //Unblock the given user
   public unblockUser = async (id: string): Promise<IUser | null> => {
    try {
      logger.debug(`Unblocking user: ${id}`);
      const user = await this.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
      if (!user) {
        logger.warn(`User not found: ${id}`);
        throw new RepositoryError(`User not found with ID: ${id}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User unblocked: ${id} (${user.email})`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error unblocking user ${id}`, err);
      throw new RepositoryError('Error unblocking user', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  //Update The user Role
   public updateUserRole = async (userId: string, role: string): Promise<IUser | null> => {
    try {
      logger.debug(`Updating role for user: ${userId} to ${role}`);
      const user = await this.findByIdAndUpdate(userId, { role }, { new: true });
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        throw new RepositoryError(`User not found with ID: ${userId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`User role updated: ${userId} to ${role}`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating role for user ${userId}`, err);
      throw new RepositoryError('Error updating user role', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
}
