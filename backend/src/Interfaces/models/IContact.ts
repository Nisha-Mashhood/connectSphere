import { Document, Types } from "mongoose";

export interface IContact extends Document {
  _id: Types.ObjectId;
  contactId: string;
  userId: string | Types.ObjectId;
  targetUserId?: string | Types.ObjectId;
  collaborationId?: string | Types.ObjectId;
  userConnectionId?: string | Types.ObjectId;
  groupId?: string | Types.ObjectId;
  type: "user-mentor" | "user-user" | "group";
  createdAt: Date;
  updatedAt: Date;
}
