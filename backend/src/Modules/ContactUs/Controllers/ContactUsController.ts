import { Request, Response } from 'express';
import { ContactMessageService } from '../Service/ContactUsService.js';
import logger from '../../../core/Utils/Logger.js';

export class ContactMessageController {
  private contactMessageService: ContactMessageService;

  constructor() {
    this.contactMessageService = new ContactMessageService();
  }

  async createContactMessage(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, message } = req.body;
      logger.debug(`Creating contact message from: ${email}`);
      if (!name || !email || !message) {
        logger.error('Missing required fields: name, email, or message');
        throw new Error('Missing required fields: name, email, or message');
      }
      const contactMessage = await this.contactMessageService.createContactMessage({ name, email, message });
      res.status(201).json({
        success: true,
        message: 'Contact message sent and saved successfully',
        data: contactMessage,
      });
    } catch (error: any) {
      logger.error(`Error creating contact message: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process contact message',
      });
    }
  }

  async getAllContactMessages(_req: Request, res: Response): Promise<void> {
    try {
      logger.debug('Fetching all contact messages');
      const messages = await this.contactMessageService.getAllContactMessages();
      res.status(200).json({
        success: true,
        message: 'Contact messages fetched successfully',
        data: messages,
      });
    } catch (error: any) {
      logger.error(`Error fetching contact messages: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch contact messages',
      });
    }
  }

  async sendReply(req: Request, res: Response): Promise<void> {
    try {
      const { contactMessageId } = req.params;
      const { email, replyMessage } = req.body;
      logger.debug(`Sending reply for contact message: ${contactMessageId}`);
      if (!email || !replyMessage) {
        logger.error('Missing required fields: email or replyMessage');
        throw new Error('Missing required fields: email or replyMessage');
      }
      const updatedMessage = await this.contactMessageService.sendReply(contactMessageId, { email, replyMessage });
      res.status(200).json({
        success: true,
        message: 'Reply sent successfully',
        data: updatedMessage,
      });
    } catch (error: any) {
      logger.error(`Error sending reply: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send reply',
      });
    }
  }
}