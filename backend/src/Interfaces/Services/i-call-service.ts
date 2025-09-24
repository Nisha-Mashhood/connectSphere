import { ICallLogPopulated } from "../../Utils/Types/call-types";

export interface ICallService {
    getCallLogsByUserId: (userId?: string) => Promise<ICallLogPopulated[]>
}