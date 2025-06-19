import { Call } from "../Interfaces/models/Call.js";
import { CallModel } from "../models/call.modal.js";


  export const create = async(call: Omit<Call, "_id" | "CallId">): Promise<Call >=> {
    return CallModel.create(call);
}


  export const findByChatKey = async(chatKey: string, limit: number = 50): Promise<Call[]> =>{
    return CallModel.find({ chatKey })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  export const findByUserId = async (userId: string, limit: number = 50): Promise<Call[]> => {
    return CallModel.find({
      $or: [{ callerId: userId }, { recipientId: userId }],
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
