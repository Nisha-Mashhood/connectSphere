import { Types } from "mongoose";
import { IMentor } from "../../../Interfaces/models/IMentor.js";

export interface CollaborationData {
  userId: Types.ObjectId;
  mentorId: IMentor;
}

export interface UserIds {
  userId: string;
  mentorUserId: string | null;
}
