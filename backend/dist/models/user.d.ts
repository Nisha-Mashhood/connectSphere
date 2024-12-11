import mongoose, { Document, Model } from "mongoose";
export interface UserInterface extends Document {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    username?: string;
    password?: string;
    jobTitle?: string;
    industry?: string;
    reasonForJoining?: string;
    role?: "user" | "mentor";
    isMentorApproved?: boolean;
    profilePic?: string;
    coverPic?: string;
    certificate?: string;
    createdAt: Date;
    updatedAt: Date;
    _id: mongoose.Types.ObjectId;
}
declare const User: Model<UserInterface>;
export default User;
//# sourceMappingURL=user.d.ts.map