import { BaseController } from '../../../core/Controller/BaseController.js';
import { ChatService } from '../Service/ChatService.js';
import { ChatRepository } from '../Repositry/ChatRepositry.js';
import { uploadMedia } from '../../../core/Utils/Cloudinary.js';
import logger from '../../../core/Utils/Logger.js';
import { HttpError } from '../../../core/Utils/ErrorHandler.js';
export class ChatController extends BaseController {
    chatService;
    chatRepo;
    constructor() {
        super();
        this.chatService = new ChatService();
        this.chatRepo = new ChatRepository();
    }
    async getChatMessages(req, res) {
        try {
            const { contactId, groupId, page = '1', limit = '10' } = req.query;
            const messages = await this.chatService.getChatMessages(contactId, groupId, parseInt(page), parseInt(limit));
            this.sendSuccess(res, messages, 'Chat messages retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async uploadAndSaveMessage(req, res) {
        try {
            const { senderId, targetId, type, collaborationId, userConnectionId, groupId } = req.body;
            if (!req.file || !senderId || !targetId || !type) {
                this.throwError(400, 'Missing required fields');
            }
            const filePath = req.file.path;
            const folder = type === 'group' ? 'group_chat_media' : 'chat_media';
            const contentType = req.file.mimetype.startsWith('image/')
                ? 'image'
                : req.file.mimetype.startsWith('video/')
                    ? 'video'
                    : 'file';
            const { url, thumbnailUrl } = await uploadMedia(filePath, folder, req.file.size, contentType);
            const message = await this.chatRepo.saveChatMessage({
                senderId,
                content: url,
                thumbnailUrl,
                contentType,
                ...(type === 'user-mentor' && { collaborationId }),
                ...(type === 'user-user' && { userConnectionId }),
                ...(type === 'group' && { groupId }),
                fileMetadata: {
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    mimeType: req.file.mimetype,
                },
                timestamp: new Date(),
            });
            logger.info(`Saved message: ${message._id}`);
            this.sendCreated(res, { url, thumbnailUrl, messageId: message._id }, 'Message uploaded and saved');
        }
        catch (error) {
            if (error.http_code === 400 && error.message.includes('Video is too large')) {
                this.handleError(new HttpError(400, 'Video is too large; processing may take time'), res);
            }
            else {
                this.handleError(error, res);
            }
        }
    }
    async getUnreadMessageCounts(req, res) {
        try {
            const { userId } = req.query;
            if (!userId) {
                this.throwError(400, 'User ID is required');
            }
            const unreadCounts = await this.chatService.getUnreadMessageCounts(userId);
            this.sendSuccess(res, unreadCounts, 'Unread message counts retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
}
//# sourceMappingURL=ChatController.js.map