export interface Call {
    _id: string;
    chatKey: string;
    callerId: string;
    recipientId: string;
    type: 'audio' | 'video';
    status: 'incoming' | 'answered' | 'missed';
    timestamp: Date;
}
export declare const CallModel: import("mongoose").Model<Call, {}, {}, {}, import("mongoose").Document<unknown, {}, Call> & Call & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=call.modal.d.ts.map