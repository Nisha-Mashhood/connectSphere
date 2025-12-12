import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/controller/base-controller';
import logger from '../core/utils/logger';
import { HttpError } from '../core/utils/error-handler';
import { IChatController } from '../Interfaces/Controller/i-chat-controller';
import { StatusCodes } from "../enums/status-code-enums";
import { IChatService } from '../Interfaces/Services/i-chat-service';
import { inject, injectable } from 'inversify';
import { CHAT_MESSAGES } from '../constants/messages';
import { ERROR_MESSAGES } from '../constants/error-messages';

@injectable()
export class ChatController extends BaseController implements IChatController{
  private _chatService: IChatService;

  constructor(
    @inject('IChatService') chatService : IChatService,
  ) {
    super();
    this._chatService = chatService;
  }

  getChatMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { contactId, groupId, page = "1", limit = "10" } = req.query;
      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10);

      if (isNaN(parsedPage) || parsedPage < 1) {
        throw new HttpError(ERROR_MESSAGES.INVALID_PAGE_NUMBER, StatusCodes.BAD_REQUEST);
      }
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new HttpError(ERROR_MESSAGES.INVALID_LIMIT_VALUE, StatusCodes.BAD_REQUEST);
      }

      logger.debug(`Fetching chat messages with contactId: ${contactId}, groupId: ${groupId}, page: ${parsedPage}, limit: ${parsedLimit}`);

      const result = await this._chatService.getChatMessages(contactId as string | undefined, groupId as string | undefined, parsedPage, parsedLimit);

      if (result.messages.length === 0) {
        this.sendSuccess(
          res,
          { messages: [], total: 0, page: parsedPage, limit: parsedLimit },
          contactId ? CHAT_MESSAGES.NO_MESSAGES_FOUND_FOR_CONTACT : CHAT_MESSAGES.NO_MESSAGES_FOUND_FOR_GROUP
        );
        logger.info(`No messages found for contactId: ${contactId || "none"}, groupId: ${groupId || "none"}`);
        return;
      }

      this.sendSuccess(
        res,
        { messages: result.messages, total: result.total, page: parsedPage, limit: parsedLimit },
        CHAT_MESSAGES.MESSAGES_RETRIEVED
      );
      logger.info(`Fetched ${result.messages.length} messages, total: ${result.total}`);
    } catch (error: any) {
      logger.error(`Error fetching chat messages: ${error.message}`);
      next(error);
    }
  };

  uploadAndSaveMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { senderId, targetId, type, collaborationId, userConnectionId, groupId } = req.body;
      if (!req.file || !senderId || !targetId || !type) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_MESSAGE_FIELDS, StatusCodes.BAD_REQUEST);
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

      this.sendCreated(res, { url: result.url, thumbnailUrl: result.thumbnailUrl, messageId: result.messageId }, CHAT_MESSAGES.MESSAGE_UPLOADED);
      logger.info(`Saved message: ${result.messageId}`);
    } catch (error: any) {
      if (error.http_code === StatusCodes.BAD_REQUEST && error.message.includes("Video is too large")) {
        throw new HttpError(ERROR_MESSAGES.VIDEO_TOO_LARGE, StatusCodes.BAD_REQUEST);
      }
      logger.error(`Error uploading and saving message: ${error.message}`);
      next(error);
    }
  };

  getUnreadMessageCounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.query;
      if (!userId) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      const unreadCounts = await this._chatService.getUnreadMessageCounts(userId as string);
      if (Object.keys(unreadCounts).length === 0) {
        this.sendSuccess(res, { unreadCounts: {} }, CHAT_MESSAGES.NO_UNREAD_MESSAGES);
        logger.info(`No unread messages found for userId: ${userId}`);
        return;
      }
      logger.debug("Unread Counts: %s", JSON.stringify(unreadCounts, null, 2));
      this.sendSuccess(res, unreadCounts, CHAT_MESSAGES.UNREAD_COUNTS_RETRIEVED);
    } catch (error: any) {
      next(error);
    }
  };

  getLastMessageSummaries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.query;
      if (!userId) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID, StatusCodes.BAD_REQUEST);
      }
      const summaries = await this._chatService.getLastMessageSummaries( userId as string );
      this.sendSuccess( res, summaries, CHAT_MESSAGES.LAST_MESSAGE_SUMMARIES_RETRIEVED  );
    } catch (error) {
      next(error);
    }
  };
}