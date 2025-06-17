import { Document, Types } from "mongoose";

export interface IContactMessage extends Document {
  _id: Types.ObjectId;
  contactMessageId: string;
  name: string;
  email: string;
  message: string;
  givenReply: boolean;
  createdAt: Date;
}
