import { ICallLog } from "../Models/IcallLog";
import { ICallLogPopulated } from "../../Utils/Types/Call.types";

export interface ICallLogRepository {
  createCallLog(data: Partial<ICallLog>): Promise<ICallLog>;
  updateCallLog(CallId: string, data: Partial<ICallLog>): Promise<ICallLog | null>;
  findCallLogByCallId(CallId: string): Promise<ICallLog | null>;
  findCallLogsByUserId(userId: string): Promise<ICallLogPopulated[]>;
}