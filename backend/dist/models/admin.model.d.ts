import mongoose, { Document, Model } from "mongoose";
export interface AdminInterface extends Document {
    name: string;
    email: string;
    password: string;
    accessToken?: string;
    profilePic?: string;
    refreshToken?: string | null;
    createdAt: Date;
    updatedAt: Date;
    _id: mongoose.Types.ObjectId;
}
declare const Admin: Model<AdminInterface>;
export default Admin;
//# sourceMappingURL=admin.model.d.ts.map