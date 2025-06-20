import { Request, Response } from 'express';
export declare class NotificationController {
    private notificationService;
    constructor();
    getNotifications: (req: Request, res: Response) => Promise<void>;
    markAsRead: (req: Request, res: Response) => Promise<void>;
    getUnreadCount: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=Notificationcontroller.d.ts.map