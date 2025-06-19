import { Server } from 'socket.io';
export declare class SocketService {
    private io;
    private notificationEmitter;
    private sentNotifications;
    private activeOffers;
    private endedCalls;
    private activeChats;
    private contactsRepo;
    private groupRepo;
    private chatRepo;
    private userRepo;
    private notificationService;
    constructor();
    initialize(io: Server): void;
    private handleConnection;
    private handleJoinChats;
    private handleJoinUserRoom;
    private handleActiveChat;
    private handleSendMessage;
    private handleTyping;
    private handleStopTyping;
    private handleMarkAsRead;
    private handleOffer;
    private handleAnswer;
    private handleIceCandidate;
    private handleCallEnded;
    private handleNotificationRead;
    private handleLeaveChat;
    private handleDisconnect;
    private emitTaskNotification;
}
//# sourceMappingURL=SocketService.d.ts.map