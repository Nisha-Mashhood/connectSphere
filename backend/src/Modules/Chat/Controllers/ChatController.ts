import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController';
import { ChatService } from '../Service/ChatService';
import { ChatRepository } from '../Repositry/ChatRepositry';
import { uploadMedia } from '../../../core/Utils/Cloudinary';
import logger from '../../../core/Utils/Logger';
import { HttpError } from '../../../core/Utils/ErrorHandler';

export class ChatController extends BaseController {
  private chatService: ChatService;
   private chatRepo: ChatRepository;

  constructor() {
    super();
    this.chatService = new ChatService();
    this.chatRepo = new ChatRepository();
  }

  getChatMessages = async(req: Request, res: Response): Promise<void> =>{
    try {
      const { contactId, groupId, page = '1', limit = '10' } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);

      if (isNaN(parsedPage) || parsedPage < 1) {
        this.throwError(400, 'Invalid page number');
      }
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        this.throwError(400, 'Invalid limit value');
      }

      logger.debug(`Fetching chat messages with contactId: ${contactId}, groupId: ${groupId}, page: ${parsedPage}, limit: ${parsedLimit}`);

      const result = await this.chatService.getChatMessages(
        contactId as string | undefined,
        groupId as string | undefined,
        parsedPage,
        parsedLimit
      );

      if (result.messages.length === 0) {
        this.sendSuccess(
          res,
          { messages: [], total: 0, page: parsedPage, limit: parsedLimit },
          contactId ? 'No messages found for this contact' : 'No messages found for this group'
        );
        logger.info(`No messages found for contactId: ${contactId || 'none'}, groupId: ${groupId || 'none'}`);
        return;
      }

      this.sendSuccess(
        res,
        { messages: result.messages, total: result.total, page: parsedPage, limit: parsedLimit },
        'Chat messages retrieved successfully'
      );
      logger.info(`Fetched ${result.messages.length} messages, total: ${result.total}`);
    } catch (error: any) {
      logger.error(`Error fetching chat messages: ${error.message}`);
      this.handleError(error, res);
    }
  }

  uploadAndSaveMessage = async(req: Request, res: Response): Promise<void> => {
    try {
      const { senderId, targetId, type, collaborationId, userConnectionId, groupId } = req.body;
      if (!req.file || !senderId || !targetId || !type) {
        this.throwError(400, 'Missing required fields');
      }

      const filePath = req.file?.path;
      if(!filePath){
        this.throwError(400, 'Missing File Path');
      }
      const folder = type === 'group' ? 'group_chat_media' : 'chat_media';
      const contentType = req.file?.mimetype.startsWith('image/')
        ? 'image'
        : req.file?.mimetype.startsWith('video/')
        ? 'video'
        : 'file';
      const { url, thumbnailUrl } = await uploadMedia(filePath as string, folder, req.file?.size, contentType);

      const message = await this.chatRepo.saveChatMessage({
        senderId,
        content: url,
        thumbnailUrl,
        contentType,
        ...(type === 'user-mentor' && { collaborationId }),
        ...(type === 'user-user' && { userConnectionId }),
        ...(type === 'group' && { groupId }),
        fileMetadata: {
          fileName: req.file?.originalname,
          fileSize: req.file?.size,
          mimeType: req.file?.mimetype,
        },
        timestamp: new Date(),
      });

      logger.info(`Saved message: ${message._id}`);
      this.sendCreated(res, { url, thumbnailUrl, messageId: message._id }, 'Message uploaded and saved');
    } catch (error: any) {
      if (error.http_code === 400 && error.message.includes('Video is too large')) {
        this.handleError(new HttpError(400, 'Video is too large; processing may take time'), res);
      } else {
        this.handleError(error, res);
      }
    }
  }

  getUnreadMessageCounts = async(req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.query;
      if (!userId) {
        this.throwError(400, 'User ID is required');
      }
      const unreadCounts = await this.chatService.getUnreadMessageCounts(userId as string);
      if (Object.keys(unreadCounts).length === 0) {
        this.sendSuccess(res, { unreadCounts: {} }, 'No unread messages found');
        logger.info(`No unread messages found for userId: ${userId}`);
        return;
      }
      logger.debug("Unread Counts: %s", JSON.stringify(unreadCounts, null, 2));
      this.sendSuccess(res, unreadCounts, 'Unread message counts retrieved successfully');
    } catch (error: any) {
      this.handleError(error, res);
    }
  }
}