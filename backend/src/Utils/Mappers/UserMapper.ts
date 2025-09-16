import { IUser } from '../../Interfaces/Models/IUser'; 
import { IUserAdminDTO, IUserDTO } from '../../Interfaces/DTOs/IUserDTO';

export function toUserDTO(user: IUser | null): IUserDTO | null {
  if (!user) return null;
  return {
    id: user._id.toString(),
    userId:user.userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    jobTitle: user.jobTitle,
    industry: user.industry,
    reasonForJoining: user.reasonForJoining,
    role: user.role,
    profilePic: user.profilePic ?? undefined,
    coverPic: user.coverPic ?? undefined,
    loginCount: user.loginCount,
    hasReviewed: user.hasReviewed,
  };
}

// For arrays 
export function toUserDTOs(users: IUser[]): IUserDTO[] {
  return users.map(toUserDTO).filter((dto): dto is IUserDTO => dto !== null);
}

//For admin (Including is Blocked)
export function toUserAdminDTO(user: IUser | null): IUserAdminDTO | null {
  if (!user) return null;
  return {
    id: user._id.toString(),
    userId:user.userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    jobTitle: user.jobTitle,
    industry: user.industry,
    reasonForJoining: user.reasonForJoining,
    role: user.role,
    profilePic: user.profilePic ?? undefined,
    coverPic: user.coverPic ?? undefined,
    loginCount: user.loginCount,
    hasReviewed: user.hasReviewed,
    isBlocked: user.isBlocked,
  };
}

export function toUserAdminDTOs(users: IUser[]): IUserAdminDTO[] {
  return users.map(toUserAdminDTO).filter((dto): dto is IUserAdminDTO => dto !== null);
}