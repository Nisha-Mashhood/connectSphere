import { ICallLogPopulated } from "../../Utils/Types/Call.types";

export interface ICallService {
    getCallLogsByUserId: (userId?: string) => Promise<ICallLogPopulated[]>
}