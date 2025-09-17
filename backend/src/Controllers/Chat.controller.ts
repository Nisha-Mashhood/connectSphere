import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../Core/Controller/BaseController';
import { uploadMedia } from '../Core/Utils/Cloudinary';
import logger from '../Core/Utils/Logger';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { IChatController } from '../Interfaces/Controller/IChatController';
import { StatusCodes } from "../Enums/StatusCode.enums";
import { IChatService } from '../Interfaces/Services/IChatService';
import { IChatRepository } from '../Interfaces/Repository/IChatRepository';
import { inject, injectable } from 'inversify';

@injectable()
export class ChatController extends BaseController implements IChatController{
  private _chatService: IChatService;
   private _chatRepo: IChatRepository;

  constructor(
    @inject('IChatService') chatService : IChatService,
    @inject('IChatRepository') chatRepository : IChatRepository
  ) {
    super();
    this._chatService = chatService;
    this._chatRepo = chatRepository;
  }

  getChatMessages = async(req: Request, res: Response, next: NextFunction): Promise<void> =>{
    try {
      const { contactId, groupId, page = '1', limit = '10' } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);

      if (isNaN(parsedPage) || parsedPage < 1) {
       throw new HttpError('Invalid page number', StatusCodes.BAD_REQUEST);
      }
      if (isNaN(parsedLimit) || parsedLimit < 1) {
       throw new HttpError('Invalid limit value', StatusCodes.BAD_REQUEST);
      }

      logger.debug(`Fetching chat messages with contactId: ${contactId}, groupId: ${groupId}, page: ${parsedPage}, limit: ${parsedLimit}`);

      const result = await this._chatService.getChatMessages(
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
      next(error)
    }
  }

  uploadAndSaveMessage = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { senderId, targetId, type, collaborationId, userConnectionId, groupId } = req.body;
      if (!req.file || !senderId || !targetId || !type) {
       throw new HttpError('Missing required fields', StatusCodes.BAD_REQUEST);
      }

      const filePath = req.file?.path;
      if(!filePath){
       throw new HttpError('Missing File Path', StatusCodes.BAD_REQUEST);
      }
      const folder = type === 'group' ? 'group_chat_media' : 'chat_media';
      const contentType = req.file?.mimetype.startsWith('image/')
        ? 'image'
        : req.file?.mimetype.startsWith('video/')
        ? 'video'
        : 'file';
      const { url, thumbnailUrl } = await uploadMedia(filePath as string, folder, req.file?.size, contentType);

      const message = await this._chatRepo.saveChatMessage({
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
      if (error.http_code === StatusCodes.BAD_REQUEST && error.message.includes('Video is too large')) {
        throw new HttpError('Video is too large; processing may take time', StatusCodes.BAD_REQUEST,)
      } else {
        next(error)
      }
    }
  }

  getUnreadMessageCounts = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.query;
      if (!userId) {
       throw new HttpError('User ID is required', StatusCodes.BAD_REQUEST);
      }
      const unreadCounts = await this._chatService.getUnreadMessageCounts(userId as string);
      if (Object.keys(unreadCounts).length === 0) {
        this.sendSuccess(res, { unreadCounts: {} }, 'No unread messages found');
        logger.info(`No unread messages found for userId: ${userId}`);
        return;
      }
      logger.debug("Unread Counts: %s", JSON.stringify(unreadCounts, null, 2));
      this.sendSuccess(res, unreadCounts, 'Unread message counts retrieved successfully');
    } catch (error: any) {
      next(error)
    }
  }
}