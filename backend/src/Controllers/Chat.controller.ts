import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../Core/Controller/BaseController';
import logger from '../Core/Utils/Logger';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { IChatController } from '../Interfaces/Controller/IChatController';
import { StatusCodes } from "../Enums/StatusCode.enums";
import { IChatService } from '../Interfaces/Services/IChatService';
import { inject, injectable } from 'inversify';

@injectable()
export class ChatController extends BaseController implements IChatController{
  private _chatService: IChatService;

  constructor(
    @inject('IChatService') chatService : IChatService,
  ) {
    super();
    this._chatService = chatService;
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

  uploadAndSaveMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { senderId, targetId, type, collaborationId, userConnectionId, groupId } = req.body;
      if (!req.file || !senderId || !targetId || !type) {
        throw new HttpError('Missing required fields: file, senderId, targetId, or type', StatusCodes.BAD_REQUEST);
      }

      logger.debug(`Uploading and saving message: senderId=${senderId}, targetId=${targetId}, type=${type}`);

      const result = await this._chatService.uploadAndSaveMessage({
        senderId,
        targetId,
        type,
        collaborationId,
        userConnectionId,
        groupId,
        file: {
          path: req.file.path,
          size: req.file.size,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
        },
      });

      this.sendCreated(res, { url: result.url, thumbnailUrl: result.thumbnailUrl, messageId: result.messageId }, 'Message uploaded and saved');
      logger.info(`Saved message: ${result.messageId}`);
    } catch (error: any) {
      if (error.http_code === StatusCodes.BAD_REQUEST && error.message.includes('Video is too large')) {
        throw new HttpError('Video is too large; processing may take time', StatusCodes.BAD_REQUEST);
      }
      logger.error(`Error uploading and saving message: ${error.message}`);
      next(error);
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