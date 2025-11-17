import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import logger from '../core/utils/logger';
import { IContactMessageController } from '../Interfaces/Controller/i-contact-us-controller';
import { HttpError } from '../core/utils/error-handler';
import { StatusCodes } from "../enums/status-code-enums";
import { BaseController } from '../core/controller/base-controller';
import { IContactMessageService } from '../Interfaces/Services/i-contact-message-service';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { CONTACT_MESSAGE_MESSAGES } from '../constants/messages';

@injectable()
export class ContactMessageController extends BaseController implements IContactMessageController{
  private _contactMessageService: IContactMessageService;

  constructor(@inject('IContactMessageService') contactMessageService : IContactMessageService) {
    super();
    this._contactMessageService = contactMessageService;
  }

   createContactMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, message } = req.body;
      logger.debug(`Creating contact message from: ${email}`);
      if (!name || !email || !message) {
        logger.error("Missing required fields: name, email, or message");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_CONTACT_MESSAGE_FIELDS, StatusCodes.BAD_REQUEST);
      }
      const contactMessage = await this._contactMessageService.createContactMessage({ name, email, message });
      this.sendCreated(res, { contactMessage }, CONTACT_MESSAGE_MESSAGES.CONTACT_MESSAGE_CREATED);
      logger.info(`Contact message created by: ${email}`);
    } catch (error: any) {
      logger.error(`Error creating contact message: ${error.message}`);
      next(error);
    }
  };

  getAllContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.debug("Controller: Fetching contact messages");

    const {
      page = "1",
      limit = "10",
      search = "",
      dateFilter = "all",
    } = req.query;

    const result = await this._contactMessageService.getAllContactMessages({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      dateFilter: dateFilter as "today" | "7days" | "30days" | "all",
    });

    this.sendSuccess(
      res,
      result,
      CONTACT_MESSAGE_MESSAGES.CONTACT_MESSAGES_FETCHED
    );
  } catch (error: any) {
    logger.error(`Error fetching contact messages: ${error.message}`);
    next(error);
  }
};


  sendReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { contactMessageId } = req.params;
      const { email, replyMessage } = req.body;
      logger.debug(`Sending reply for contact message: ${contactMessageId}`);
      if (!email || !replyMessage) {
        logger.error("Missing required fields: email or replyMessage");
        throw new HttpError(ERROR_MESSAGES.REQUIRED_EMAIL_REPLY_MESSAGE, StatusCodes.BAD_REQUEST);
      }
      const updatedMessage = await this._contactMessageService.sendReply(contactMessageId, { email, replyMessage });
      this.sendSuccess(res, { updatedMessage }, CONTACT_MESSAGE_MESSAGES.REPLY_SENT);
      logger.info(`Reply sent for contact message: ${contactMessageId}`);
    } catch (error: any) {
      logger.error(`Error sending reply: ${error.message}`);
      next(error);
    }
  };
}