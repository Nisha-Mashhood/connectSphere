import { BaseService } from '../../../core/Services/BaseService';
import { ServiceError } from '../../../core/Utils/ErrorHandler';
import logger from '../../../core/Utils/Logger';
import { ContactMessageRepository } from '../Repositry/ContactUsRepositry';
import { IContactMessage } from '../../../Interfaces/models/IContactMessage';
import { sendEmail } from '../../../core/Utils/Email';
import config from '../../../config/env.config';

export class ContactMessageService extends BaseService {
  private contactMessageRepo: ContactMessageRepository;

  constructor() {
    super();
    this.contactMessageRepo = new ContactMessageRepository();
  }

   createContactMessage = async(data: { name: string; email: string; message: string }): Promise<IContactMessage> => {
    try {
      logger.debug(`Creating contact message from: ${data.email}`);
      this.checkData(data);

      const ReceiverEmail = config.adminEmail;
      if (!ReceiverEmail) {
        logger.error('Receiver email not configured');
        throw new ServiceError('Receiver email required');
      }

      const contactMessage = await this.contactMessageRepo.createContactMessage(data);

      const emailText = `New Contact Message\n\nName: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}\n\nSent at: ${new Date().toLocaleString()}`;
      await sendEmail(ReceiverEmail, 'New Contact Message from ConnectSphere', emailText);

      return contactMessage;
    } catch (error: any) {
      logger.error(`Error processing contact message: ${error.message}`);
      throw new ServiceError(`Error processing contact message: ${error.message}`);
    }
  }

   getAllContactMessages = async(): Promise<IContactMessage[]> => {
    try {
      logger.debug('Fetching all contact messages');
      const messages = await this.contactMessageRepo.getAllContactMessages();
      return  messages;
    } catch (error: any) {
      logger.error(`Error fetching contact messages: ${error.message}`);
      throw new ServiceError(`Error fetching contact messages: ${error.message}`);
    }
  }

   sendReply = async(contactMessageId: string, replyData: { email: string; replyMessage: string }): Promise<IContactMessage> => {
    try {
      logger.debug(`Sending reply for contact message: ${contactMessageId}`);
      this.checkData({ contactMessageId, ...replyData });

      const updatedMessage = await this.contactMessageRepo.updateReplyStatus(contactMessageId);

      await sendEmail(
        replyData.email,
        'Reply from ConnectSphere',
        `Hello ${updatedMessage.name},\n\n${replyData.replyMessage}\n\nBest regards,\nConnectSphere Team`
      );

      return updatedMessage;
    } catch (error: any) {
      logger.error(`Error sending reply: ${error.message}`);
      throw new ServiceError(`Error sending reply: ${error.message}`);
    }
  }
}