import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import logger from '../Core/Utils/Logger';
import { IContactMessageController } from '../Interfaces/Controller/IContactUsController';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { StatusCodes } from "../Constants/StatusCode.constants";
import { BaseController } from '../Core/Controller/BaseController';
import { IContactMessageService } from '../Interfaces/Services/IContactMessageService';

export class ContactMessageController extends BaseController implements IContactMessageController{
  private _contactMessageService: IContactMessageService;

  constructor(@inject('IContactMessageService') contactMessageService : IContactMessageService) {
    super();
    this._contactMessageService = contactMessageService;
  }

    createContactMessage = async(req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      const { name, email, message } = req.body;
      logger.debug(`Creating contact message from: ${email}`);
      if (!name || !email || !message) {
        logger.error('Missing required fields: name, email, or message');
        throw new HttpError('Missing required fields: name, email, or message', StatusCodes.BAD_REQUEST);
      }
      const contactMessage = await this._contactMessageService.createContactMessage({ name, email, message });
      this.sendCreated(res, { contactMessage }, 'Contact message sent and saved successfully');
      logger.info(`Contact message created by: ${email}`);
    } catch (error: any) {
      logger.error(`Error creating contact message: ${error.message}`);
      next(error)
    }
  }

    getAllContactMessages = async(_req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
      logger.debug('Fetching all contact messages');
      const messages = await this._contactMessageService.getAllContactMessages();
      if (messages.length === 0) {
        this.sendSuccess(res, { messages: [] }, 'No contact messages found');
        logger.info('No contact messages found');
        return;
      }
      this.sendSuccess(res, { messages }, 'Contact messages fetched successfully');
      logger.info('Fetched all contact messages');
    } catch (error: any) {
      logger.error(`Error fetching contact messages: ${error.message}`);
      next(error)
    }
  }

    sendReply = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const { contactMessageId } = req.params;
      const { email, replyMessage } = req.body;
      logger.debug(`Sending reply for contact message: ${contactMessageId}`);
      if (!email || !replyMessage) {
        logger.error('Missing required fields: email or replyMessage');
        throw new HttpError('Missing required fields: email or replyMessage', StatusCodes.BAD_REQUEST);
      }
      const updatedMessage = await this._contactMessageService.sendReply(contactMessageId, { email, replyMessage });
      this.sendSuccess(res, { updatedMessage }, 'Reply sent successfully');
      logger.info(`Reply sent for contact message: ${contactMessageId}`);
    } catch (error: any) {
      logger.error(`Error sending reply: ${error.message}`);
      next(error)
    }
  }
}