export interface IUserDTO {
  id: string;
  userId:string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  jobTitle?: string;
  industry?: string;
  reasonForJoining?: string;
  role?: "user" | "mentor" | "admin";
  profilePic?: string;
  coverPic?: string;
  loginCount: number;
  hasReviewed: boolean;
}


export interface IUserAdminDTO extends IUserDTO {
  isBlocked: boolean;
}

