import { Socket, Server } from "socket.io";
import logger from "../../core/utils/logger";
import { ICallLog } from "../../Interfaces/Models/i-call-log";
import { ICallLogRepository } from "../../Interfaces/Repository/i-call-repositry";

export const createCallLog = async(
  socket: Socket,
  io: Server | null,
  callLogRepo: ICallLogRepository,
  data: {
    CallId: string;
    chatKey: string;
    callType: "audio" | "video";
    type: "group" | "user-mentor" | "user-user";
    senderId: string;
    recipientIds: string[];
    groupId?: string;
    callerName: string;
  }
): Promise<ICallLog | null> => {
  try {
    const callLogData: Partial<ICallLog> = {
      CallId: data.CallId,
      chatKey: data.chatKey,
      callType: data.callType,
      type: data.type,
      senderId: data.senderId,
      recipientIds: data.recipientIds,
      groupId: data.groupId,
      status: "ongoing",
      callerName: data.callerName,
      startTime: new Date(),
    };

    const callLog = await callLogRepo.createCallLog(callLogData);
    logger.info(`Created call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`);

    const allParticipants = [data.senderId, ...data.recipientIds];
    allParticipants.forEach((participantId) => {
      io?.to(`user_${participantId}`).emit("callLog.created", {
        ...callLog.toObject()
      });
      logger.info(`Emitted callLog.created to user_${participantId} for CallId: ${callLog.CallId}`);
    });

    return callLog;
  } catch (error: any) {
    logger.error(`Error creating call log for chatKey: ${data.chatKey}, CallId: ${data.CallId}: ${error.message}`);
    socket.emit("error", { message: "Failed to create call log" });
    return null;
  }
}

export const updateCallLog = async (
  socket: Socket,
  io: Server | null,
  callLogRepo: ICallLogRepository,
  callId: string,
  senderId: string,
  recipientIds: string[],
  updateData: Partial<ICallLog>
): Promise<ICallLog | null> => {
  try {
    const callLog = await callLogRepo.findCallLogByCallId(callId);
    if (!callLog) {
      logger.error(`Call log not found for CallId: ${callId}`);
      socket.emit("error", { message: "Call log not found" });
      return null;
    }

    const endTime = updateData.status === "completed" || updateData.status === "missed" 
      ? updateData.endTime || new Date()
      : undefined;

    let duration: number | undefined;
    if (updateData.status === "completed" && callLog.startTime && endTime) {
      duration = Math.round((endTime.getTime() - callLog.startTime.getTime()) / 1000);
      logger.debug(`Calculated duration for CallId: ${callId}: ${duration} seconds`);
    } else if (updateData.status === "completed" && !callLog.startTime) {
      logger.warn(`Missing startTime for completed call, CallId: ${callId}`);
      duration = 0;
    }

    const updatedCallLog = await callLogRepo.updateCallLog(callId, {
      ...updateData,
      endTime,
      duration,
      updatedAt: new Date(),
    });

    if (updatedCallLog) {
      const allParticipants = [senderId, ...recipientIds];
      allParticipants.forEach((participantId) => {
        io?.to(`user_${participantId}`).emit("callLog.updated", {
          ...updatedCallLog.toObject(),
        });
        logger.info(
          `Emitted callLog.updated to user_${participantId} for CallId: ${callId}, status: ${updatedCallLog.status}, duration: ${updatedCallLog.duration || 'N/A'}`
        );
      });
      return updatedCallLog;
    }

    logger.error(`Failed to update call log for CallId: ${callId}: No updated document returned`);
    socket.emit("error", { message: "Failed to update call log" });
    return null;
  } catch (error: any) {
    logger.error(`Error updating call log for CallId: ${callId}: ${error.message}`);
    socket.emit("error", { message: "Failed to update call log" });
    return null;
  }
}